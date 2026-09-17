import { prisma } from "../../config/database";
import { Prisma } from "../../generated/prisma/client";
import { ConflictError, NotFoundError } from "../../lib/errors";
import type { CreateCategoryInput, UpdateCategoryInput } from "./categories.schema";
import type { CategoryResponse } from "./categories.types";

export async function listCategories(): Promise<CategoryResponse[]> {
  return prisma.category.findMany({
    select: categorySelect,
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(
  categoryId: string,
): Promise<CategoryResponse> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: categorySelect,
  });

  if (!category) {
    throw new NotFoundError("Categoría no encontrada");
  }

  return category;
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<CategoryResponse> {
  try {
    return await prisma.category.create({
      data: { name: input.name },
      select: categorySelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictError(
        `La categoría "${input.name}" ya existe`,
      );
    }
    throw error;
  }
}

export async function updateCategory(
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<CategoryResponse> {
  try {
    const updateData: Record<string, string> = {};
    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    const result = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      select: categorySelect,
    });
    return result;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Categoría no encontrada");
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictError(
        `La categoría "${input.name}" ya existe`,
      );
    }
    throw error;
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError("Categoría no encontrada");
    }
    throw error;
  }
}

const categorySelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CategorySelect;
