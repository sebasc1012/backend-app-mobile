import { prisma } from "../../config/database";
import { Prisma } from "../../generated/prisma/client";
import { ForbiddenError, NotFoundError } from "../../lib/errors";
import type { OccurrenceResponse } from "./occurrences.types";

export async function listOccurrences(
  commitmentId: string,
  userId: string,
): Promise<OccurrenceResponse[]> {
  await validateCommitmentOwnership(commitmentId, userId);

  const occurrences = await prisma.occurrence.findMany({
    where: { financialCommitmentId: commitmentId },
    select: occurrenceSelect,
    orderBy: { dueDate: "asc" },
  });

  return occurrences.map(serializeOccurrence);
}

export async function getOccurrenceById(
  occurrenceId: string,
  userId: string,
): Promise<OccurrenceResponse> {
  const occurrence = await prisma.occurrence.findUnique({
    where: { id: occurrenceId },
    select: {
      ...occurrenceSelect,
      financialCommitment: { select: { userId: true } },
    },
  });

  if (!occurrence) {
    throw new NotFoundError("Ocurrencia no encontrada");
  }

  if (occurrence.financialCommitment.userId !== userId) {
    throw new ForbiddenError("No tienes permiso para acceder a esta ocurrencia");
  }

  const { financialCommitment, ...rest } = occurrence;
  return serializeOccurrence(rest);
}

export async function generateOccurrences(
  commitmentId: string,
  daysAhead: number = 90,
): Promise<OccurrenceResponse[]> {
  const commitment = await prisma.financialCommitment.findUnique({
    where: { id: commitmentId },
  });

  if (!commitment) {
    throw new NotFoundError("Compromiso no encontrado");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + daysAhead);

  const dueDates: Date[] = [];
  let current = new Date(commitment.nextDueDate);

  while (current <= endDate) {
    dueDates.push(new Date(current));
    current = addDaysToDate(current, 1);
  }

  const occurrences = await Promise.all(
    dueDates.map((dueDate) =>
      prisma.occurrence.upsert({
        where: {
          financialCommitmentId_dueDate: {
            financialCommitmentId: commitmentId,
            dueDate,
          },
        },
        create: {
          financialCommitmentId: commitmentId,
          dueDate,
          status: "PENDING",
        },
        update: {},
        select: occurrenceSelect,
      }),
    ),
  );

  return occurrences.map(serializeOccurrence);
}

export async function markPaid(
  occurrenceId: string,
  userId: string,
  paidAt?: string,
): Promise<OccurrenceResponse> {
  const occurrence = await prisma.occurrence.findUnique({
    where: { id: occurrenceId },
    select: {
      ...occurrenceSelect,
      financialCommitment: { select: { userId: true } },
    },
  });

  if (!occurrence) {
    throw new NotFoundError("Ocurrencia no encontrada");
  }

  if (occurrence.financialCommitment.userId !== userId) {
    throw new ForbiddenError("No tienes permiso para marcar esta ocurrencia");
  }

  const { financialCommitment, ...rest } = occurrence;

  const updated = await prisma.occurrence.update({
    where: { id: occurrenceId },
    data: { status: "PAID" },
    select: occurrenceSelect,
  });

  if (paidAt) {
    await prisma.payment.upsert({
      where: { occurrenceId },
      create: {
        occurrenceId,
        paidAt: new Date(paidAt),
      },
      update: {
        paidAt: new Date(paidAt),
      },
    });
  }

  return serializeOccurrence(updated);
}

const occurrenceSelect = {
  id: true,
  financialCommitmentId: true,
  dueDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.OccurrenceSelect;

function serializeOccurrence(
  occurrence: Prisma.OccurrenceGetPayload<{ select: typeof occurrenceSelect }>,
): OccurrenceResponse {
  return {
    id: occurrence.id!,
    financialCommitmentId: occurrence.financialCommitmentId!,
    dueDate: occurrence.dueDate.toISOString().split("T")[0]!,
    status: occurrence.status!,
    createdAt: occurrence.createdAt!,
    updatedAt: occurrence.updatedAt!,
  };
}

async function validateCommitmentOwnership(
  commitmentId: string,
  userId: string,
): Promise<void> {
  const commitment = await prisma.financialCommitment.findUnique({
    where: { id: commitmentId },
    select: { userId: true },
  });

  if (!commitment) {
    throw new NotFoundError("Compromiso no encontrado");
  }

  if (commitment.userId !== userId) {
    throw new ForbiddenError("No tienes permiso para acceder a este compromiso");
  }
}

function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
