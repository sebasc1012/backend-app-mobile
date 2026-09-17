import { prisma } from "../../config/database";
import { Prisma } from "../../generated/prisma/client";
import { ForbiddenError, NotFoundError } from "../../lib/errors";
import { calculateNextDueDate, type Frequency } from "../commitments/recurrence.service";
import type { PaymentResponse } from "./payments.types";

export async function createPayment(
  userId: string,
  occurrenceId: string,
  paidAmount?: string,
  paidAt?: string,
): Promise<PaymentResponse> {
  const occurrence = await prisma.occurrence.findUnique({
    where: { id: occurrenceId },
    select: {
      financialCommitmentId: true,
      dueDate: true,
      financialCommitment: {
        select: {
          userId: true,
          frequency: true,
          startDate: true,
          recurrenceDay: true,
        },
      },
    },
  });

  if (!occurrence) {
    throw new NotFoundError("Ocurrencia no encontrada");
  }

  if (occurrence.financialCommitment.userId !== userId) {
    throw new ForbiddenError("No tienes permiso para registrar este pago");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Mark occurrence as paid
    await tx.occurrence.update({
      where: { id: occurrenceId },
      data: { status: "PAID" },
    });

    // Create payment record
    const payment = await tx.payment.create({
      data: {
        occurrenceId,
        paidAmount: paidAmount ? new Prisma.Decimal(paidAmount) : null,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      },
      select: paymentSelect,
    });

    // Calculate next due date and update commitment
    const nextDueDate = calculateNextDueDate(
      occurrence.financialCommitment.startDate,
      occurrence.financialCommitment.frequency as Frequency,
      occurrence.financialCommitment.recurrenceDay,
    );

    // Move nextDueDate to next period after this occurrence
    let futureDate = new Date(nextDueDate);
    while (futureDate <= occurrence.dueDate) {
      futureDate = addDaysToDate(futureDate, 1);
    }

    await tx.financialCommitment.update({
      where: { id: occurrence.financialCommitmentId },
      data: { nextDueDate: futureDate },
    });

    return payment;
  });

  return serializePayment(result);
}

export async function listPayments(
  commitmentId: string,
  userId: string,
): Promise<PaymentResponse[]> {
  const commitment = await prisma.financialCommitment.findUnique({
    where: { id: commitmentId },
    select: { userId: true },
  });

  if (!commitment) {
    throw new NotFoundError("Compromiso no encontrado");
  }

  if (commitment.userId !== userId) {
    throw new ForbiddenError("No tienes permiso para ver estos pagos");
  }

  const payments = await prisma.payment.findMany({
    where: {
      occurrence: { financialCommitmentId: commitmentId },
    },
    select: paymentSelect,
    orderBy: { createdAt: "desc" },
  });

  return payments.map(serializePayment);
}

export async function getPaymentById(
  paymentId: string,
  userId: string,
): Promise<PaymentResponse> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      ...paymentSelect,
      occurrence: {
        select: {
          financialCommitment: { select: { userId: true } },
        },
      },
    },
  });

  if (!payment) {
    throw new NotFoundError("Pago no encontrado");
  }

  if (payment.occurrence.financialCommitment.userId !== userId) {
    throw new ForbiddenError("No tienes permiso para acceder a este pago");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { occurrence, ...rest } = payment;
  return serializePayment(rest as Prisma.PaymentGetPayload<{ select: typeof paymentSelect }>);
}

const paymentSelect = {
  id: true,
  occurrenceId: true,
  paidAmount: true,
  paidAt: true,
  createdAt: true,
} satisfies Prisma.PaymentSelect;

function serializePayment(
  payment: Prisma.PaymentGetPayload<{ select: typeof paymentSelect }>,
): PaymentResponse {
  return {
    id: payment.id!,
    occurrenceId: payment.occurrenceId!,
    paidAmount: payment.paidAmount ? payment.paidAmount.toString() : null,
    paidAt: payment.paidAt.toISOString(),
    createdAt: payment.createdAt!,
  };
}

function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
