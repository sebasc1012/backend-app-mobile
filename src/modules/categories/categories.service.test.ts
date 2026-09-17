import { jest, describe, it, expect } from "@jest/globals";
import type { CategoryResponse } from "./categories.types";
import { Prisma } from "../../generated/prisma/client";

const findManyMock = jest.fn<(args: unknown) => Promise<CategoryResponse[]>>();

const findUniqueMock =
  jest.fn<(args: unknown) => Promise<CategoryResponse | null>>();

const createMock = jest.fn<(args: unknown) => Promise<CategoryResponse>>();

const updateMock = jest.fn<(args: unknown) => Promise<CategoryResponse>>();

const deleteMock = jest.fn<(args: unknown) => Promise<CategoryResponse>>();

jest.unstable_mockModule("../../config/database", () => ({
  prisma: {
    category: {
      findMany: findManyMock,
      findUnique: findUniqueMock,
      create: createMock,
      update: updateMock,
      delete: deleteMock,
    },
  },
}));

const {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = await import("./categories.service");

describe("categories.service", () => {
  describe("listCategories", () => {
    it("should return all categories", async () => {
      const mockCategories: CategoryResponse[] = [
        {
          id: "category-1",
          name: "Entretenimiento",
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
        },
        {
          id: "category-2",
          name: "Servicios",
          createdAt: new Date("2026-01-02"),
          updatedAt: new Date("2026-01-02"),
        },
      ];

      findManyMock.mockResolvedValue(mockCategories);

      const result = await listCategories();

      expect(result).toEqual(mockCategories);

      expect(findManyMock).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          name: "asc",
        },
      });
    });
  });
});

describe("getCategoryById", () => {
  it("should return the category when it exists", async () => {
    const mockCategory: CategoryResponse = {
      id: "category-1",
      name: "Entretenimiento",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    };

    findUniqueMock.mockResolvedValue(mockCategory);

    const result = await getCategoryById("category-1");

    expect(result).toEqual(mockCategory);

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: {
        id: "category-1",
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it("should throw NotFoundError when the category does not exist", async () => {
    findUniqueMock.mockResolvedValue(null);

    await expect(getCategoryById("category-999")).rejects.toMatchObject({
      message: "Categoría no encontrada",
      statusCode: 404,
      isOperational: true,
    });

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: {
        id: "category-999",
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
});

describe("createCategory", () => {
  it("should create and return a category", async () => {
    const input = {
      name: "Entretenimiento",
    };

    const mockCategory: CategoryResponse = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Entretenimiento",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    };

    createMock.mockResolvedValue(mockCategory);

    const result = await createCategory(input);

    expect(result).toEqual(mockCategory);

    expect(createMock).toHaveBeenCalledWith({
      data: {
        name: "Entretenimiento",
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
  it("should throw ConflictError when the category already exists", async () => {
    const input = {
      name: "Entretenimiento",
    };

    const prismaError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "7.9.1",
      },
    );

    createMock.mockRejectedValue(prismaError);

    await expect(createCategory(input)).rejects.toMatchObject({
      message: 'La categoría "Entretenimiento" ya existe',
      statusCode: 409,
      isOperational: true,
    });

    expect(createMock).toHaveBeenCalledWith({
      data: {
        name: "Entretenimiento",
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
  it("should propagate unexpected errors", async () => {
    const input = {
      name: "Entretenimiento",
    };

    const unexpectedError = new Error("Database connection failed");

    createMock.mockRejectedValue(unexpectedError);

    await expect(createCategory(input)).rejects.toBe(unexpectedError);
  });
});

describe("updateCategory", () => {
  it("should update and return the category", async () => {
    const categoryId = "550e8400-e29b-41d4-a716-446655440000";

    const input = {
      name: "Entretenimiento",
    };

    const mockCategory: CategoryResponse = {
      id: categoryId,
      name: "Entretenimiento",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    };

    updateMock.mockResolvedValue(mockCategory);

    const result = await updateCategory(categoryId, input);

    expect(result).toEqual(mockCategory);

    expect(updateMock).toHaveBeenCalledWith({
      where: {
        id: categoryId,
      },
      data: {
        name: "Entretenimiento",
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
  it("should throw NotFoundError when the category does not exist", async () => {
    const categoryId = "550e8400-e29b-41d4-a716-446655440001";

    const input = {
      name: "Entretenimiento",
    };

    const prismaError = new Prisma.PrismaClientKnownRequestError(
      "Record to update not found",
      {
        code: "P2025",
        clientVersion: "7.9.1",
      },
    );

    updateMock.mockRejectedValue(prismaError);

    await expect(updateCategory(categoryId, input)).rejects.toMatchObject({
      message: "Categoría no encontrada",
      statusCode: 404,
      isOperational: true,
    });

    expect(updateMock).toHaveBeenCalledWith({
      where: {
        id: categoryId,
      },
      data: {
        name: "Entretenimiento",
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
  it("should throw ConflictError when the new category name already exists", async () => {
    const categoryId = "550e8400-e29b-41d4-a716-446655440000";

    const input = {
      name: "Entretenimiento",
    };

    const prismaError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "7.9.1",
      },
    );

    updateMock.mockRejectedValue(prismaError);

    await expect(updateCategory(categoryId, input)).rejects.toMatchObject({
      message: 'La categoría "Entretenimiento" ya existe',
      statusCode: 409,
      isOperational: true,
    });

    expect(updateMock).toHaveBeenCalledWith({
      where: {
        id: categoryId,
      },
      data: {
        name: "Entretenimiento",
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
  it("should propagate unexpected errors", async () => {
    const categoryId = "550e8400-e29b-41d4-a716-446655440000";

    const input = {
      name: "Entretenimiento",
    };

    const unexpectedError = new Error("Database connection failed");

    updateMock.mockRejectedValue(unexpectedError);

    await expect(updateCategory(categoryId, input)).rejects.toBe(
      unexpectedError,
    );
  });
});

describe("deleteCategory", () => {
  it("should delete the category", async () => {
    const categoryId = "550e8400-e29b-41d4-a716-446655440000";

    deleteMock.mockResolvedValue({
      id: categoryId,
      name: "Entretenimiento",
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    });

    await expect(deleteCategory(categoryId)).resolves.toBeUndefined();

    expect(deleteMock).toHaveBeenCalledWith({
      where: {
        id: categoryId,
      },
    });
  });
  it("should throw NotFoundError when the category does not exist", async () => {
    const categoryId = "550e8400-e29b-41d4-a716-446655440001";

    const prismaError = new Prisma.PrismaClientKnownRequestError(
      "Record to delete not found",
      {
        code: "P2025",
        clientVersion: "7.9.1",
      },
    );

    deleteMock.mockRejectedValue(prismaError);

    await expect(deleteCategory(categoryId)).rejects.toMatchObject({
      message: "Categoría no encontrada",
      statusCode: 404,
      isOperational: true,
    });

    expect(deleteMock).toHaveBeenCalledWith({
      where: {
        id: categoryId,
      },
    });
  });
  it("should propagate unexpected errors", async () => {
    const categoryId = "550e8400-e29b-41d4-a716-446655440000";

    const unexpectedError = new Error("Database connection failed");

    deleteMock.mockRejectedValue(unexpectedError);

    await expect(deleteCategory(categoryId)).rejects.toBe(unexpectedError);
  });
});