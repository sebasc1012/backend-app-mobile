import { prisma } from "../../config/database";
import { Prisma } from "../../generated/prisma/client";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../lib/errors";
import { calculateNextDueDate, type Frequency } from "./recurrence.service";
import type {
  CreateCommitmentInput,
  UpdateCommitmentInput,
} from "./commitments.schema";
import type { FinancialCommitmentResponse } from "./commitments.types";

export async function listCommitments(
  userId: string,
): Promise<FinancialCommitmentResponse[]> {
  const commitments = await prisma.financialCommitment.findMany({
    where: { userId },
    select: commitmentSelect,
    orderBy: { nextDueDate: "asc" },
  });

  return commitments.map(serializeCommitment);
}

export async function getCommitmentById(
  commitmentId: string,
  userId: string,
): Promise<FinancialCommitmentResponse> {
  const commitment = await prisma.financialCommitment.findUnique({
    where: { id: commitmentId },
    select: commitmentSelect,
  });

  if (!commitment) {
    throw new NotFoundError("Compromiso financiero no encontrado");
  }

  validateOwnership(commitment.userId, userId);

  return serializeCommitment(commitment);
}

export async function createCommitment(
  userId: string,
  input: CreateCommitmentInput,
): Promise<FinancialCommitmentResponse> {
  const nextDueDate = calculateNextDueDate(
    new Date(input.startDate),
    input.frequency as Frequency,
    input.recurrenceDay,
  );

  try {
    const commitment = await prisma.financialCommitment.create({
      data: {
        userId,
        type: input.type,
        name: input.name,
        description: input.description ?? null,
        categoryId: input.categoryId,
        defaultAmount: input.defaultAmount ? new Prisma.Decimal(input.defaultAmount) : null,
        frequency: input.frequency,
        startDate: new Date(input.startDate),
        recurrenceDay: input.recurrenceDay ?? null,
        nextDueDate,
        reminderDaysBefore: input.reminderDaysBefore,
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: input.status,
      },
      select: commitmentSelect,
    });

    return serializeCommitment(commitment);
  } catch (error) {
    handleCommitmentError(error, "crear");
  }
}

export async function updateCommitment(
  commitmentId: string,
  userId: string,
  input: UpdateCommitmentInput,
): Promise<FinancialCommitmentResponse> {
  const existing = await prisma.financialCommitment.findUnique({
    where: { id: commitmentId },
  });

  if (!existing) {
    throw new NotFoundError("Compromiso financiero no encontrado");
  }

  validateOwnership(existing.userId, userId);

  const updateData = buildUpdateData(input, existing);

  try {
    const commitment = await prisma.financialCommitment.update({
      where: { id: commitmentId },
      data: updateData,
      select: commitmentSelect,
    });

    return serializeCommitment(commitment);
  } catch (error) {
    handleCommitmentError(error, "actualizar");
  }
}

export async function deleteCommitment(
  commitmentId: string,
  userId: string,
): Promise<void> {
  const commitment = await prisma.financialCommitment.findUnique({
    where: { id: commitmentId },
  });

  if (!commitment) {
    throw new NotFoundError("Compromiso financiero no encontrado");
  }

  validateOwnership(commitment.userId, userId);

  try {
    await prisma.financialCommitment.delete({
      where: { id: commitmentId },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Compromiso financiero no encontrado");
    }
    throw error;
  }
}

const commitmentSelect = {
  id: true,
  userId: true,
  type: true,
  name: true,
  description: true,
  categoryId: true,
  defaultAmount: true,
  frequency: true,
  startDate: true,
  recurrenceDay: true,
  nextDueDate: true,
  reminderDaysBefore: true,
  endDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FinancialCommitmentSelect;

function validateOwnership(resourceUserId: string, authenticatedUserId: string): void {
  if (resourceUserId !== authenticatedUserId) {
    throw new ForbiddenError("No tienes permiso para acceder a este recurso");
  }
}

function handleCommitmentError(error: unknown, _action: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      throw new NotFoundError("Compromiso financiero no encontrado");
    }
    if (error.code === "P2003") {
      throw new ConflictError("La categoría especificada no existe");
    }
  }
  throw error;
}

function buildUpdateData(
  input: UpdateCommitmentInput,
  existing: Awaited<ReturnType<typeof prisma.financialCommitment.findUnique>>,
): Prisma.FinancialCommitmentUpdateInput {
  if (!existing) {
    throw new NotFoundError("Compromiso financiero no encontrado");
  }

  const updateData: Prisma.FinancialCommitmentUpdateInput = {};

  if (input.type !== undefined) updateData.type = input.type;
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.categoryId !== undefined) updateData.category = { connect: { id: input.categoryId } };
  if (input.defaultAmount !== undefined) updateData.defaultAmount = new Prisma.Decimal(input.defaultAmount);
  if (input.frequency !== undefined) updateData.frequency = input.frequency;
  if (input.startDate !== undefined) updateData.startDate = new Date(input.startDate);
  if (input.recurrenceDay !== undefined) updateData.recurrenceDay = input.recurrenceDay;
  if (input.reminderDaysBefore !== undefined) updateData.reminderDaysBefore = input.reminderDaysBefore;
  if (input.endDate !== undefined) updateData.endDate = input.endDate ? new Date(input.endDate) : null;
  if (input.status !== undefined) updateData.status = input.status;

  if (
    input.frequency !== undefined ||
    input.startDate !== undefined ||
    input.recurrenceDay !== undefined
  ) {
    const frequency = input.frequency ?? (existing.frequency as Frequency);
    const startDate = input.startDate ? new Date(input.startDate) : existing.startDate;
    const recurrenceDay = input.recurrenceDay !== undefined ? input.recurrenceDay : existing.recurrenceDay;

    updateData.nextDueDate = calculateNextDueDate(startDate, frequency, recurrenceDay);
  }

  return updateData;
}

function serializeCommitment(
  commitment: Prisma.FinancialCommitmentGetPayload<{
    select: typeof commitmentSelect;
  }>,
): FinancialCommitmentResponse {
  return {
    id: commitment.id!,
    userId: commitment.userId!,
    type: commitment.type!,
    name: commitment.name!,
    description: commitment.description,
    categoryId: commitment.categoryId!,
    defaultAmount: commitment.defaultAmount
      ? commitment.defaultAmount.toString()
      : null,
    frequency: commitment.frequency!,
    startDate: (commitment.startDate as Date).toISOString().split("T")[0]!,
    recurrenceDay: commitment.recurrenceDay,
    nextDueDate: (commitment.nextDueDate as Date).toISOString().split("T")[0]!,
    reminderDaysBefore: commitment.reminderDaysBefore!,
    endDate: commitment.endDate
      ? (commitment.endDate as Date).toISOString().split("T")[0]!
      : null,
    status: commitment.status!,
    createdAt: commitment.createdAt!,
    updatedAt: commitment.updatedAt!,
  };
}
