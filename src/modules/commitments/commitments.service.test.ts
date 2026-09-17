import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const findUniqueMock = jest.fn<(args: unknown) => Promise<unknown>>();
const deleteMock = jest.fn<(args: unknown) => Promise<unknown>>();

jest.unstable_mockModule("../../config/database", () => ({
  prisma: {
    financialCommitment: {
      findUnique: findUniqueMock,
      delete: deleteMock,
    },
  },
}));

const {
  getCommitmentById,
  deleteCommitment,
} = await import("./commitments.service");

describe("commitments.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCommitmentById", () => {
    it("should call findUnique with correct parameters", async () => {
      const userId = "user-123";
      const commitmentId = "commit-1";

      findUniqueMock.mockResolvedValue({
        id: commitmentId,
        userId,
        type: "OBLIGATION",
        name: "Netflix",
        description: null,
        categoryId: "cat-1",
        defaultAmount: null,
        frequency: "MONTHLY",
        startDate: new Date("2026-01-01"),
        recurrenceDay: null,
        nextDueDate: new Date("2026-02-01"),
        reminderDaysBefore: 3,
        endDate: null,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await getCommitmentById(commitmentId, userId);

      expect(findUniqueMock).toHaveBeenCalledWith({
        where: { id: commitmentId },
        select: expect.any(Object),
      });
    });

    it("should throw ForbiddenError when user is not owner", async () => {
      const userId = "hacker-user";
      const commitmentId = "commit-1";
      const ownerId = "user-123";

      findUniqueMock.mockResolvedValue({
        id: commitmentId,
        userId: ownerId,
        name: "Netflix",
        type: "OBLIGATION",
        description: null,
        categoryId: "cat-1",
        defaultAmount: null,
        frequency: "MONTHLY",
        startDate: new Date("2026-01-01"),
        recurrenceDay: null,
        nextDueDate: new Date("2026-02-01"),
        reminderDaysBefore: 3,
        endDate: null,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(getCommitmentById(commitmentId, userId)).rejects.toMatchObject({
        statusCode: 403,
        isOperational: true,
      });
    });

    it("should throw NotFoundError when commitment does not exist", async () => {
      findUniqueMock.mockResolvedValue(null);

      await expect(getCommitmentById("nonexistent", "user-123")).rejects.toMatchObject({
        statusCode: 404,
        isOperational: true,
      });
    });
  });

  describe("deleteCommitment", () => {
    it("should delete commitment when user is owner", async () => {
      const userId = "user-123";
      const commitmentId = "commit-1";

      findUniqueMock.mockResolvedValue({
        id: commitmentId,
        userId,
        name: "Netflix",
        type: "OBLIGATION",
        description: null,
        categoryId: "cat-1",
        defaultAmount: null,
        frequency: "MONTHLY",
        startDate: new Date("2026-01-01"),
        recurrenceDay: null,
        nextDueDate: new Date("2026-02-01"),
        reminderDaysBefore: 3,
        endDate: null,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      deleteMock.mockResolvedValue({} as never);

      await expect(deleteCommitment(commitmentId, userId)).resolves.toBeUndefined();

      expect(deleteMock).toHaveBeenCalledWith({
        where: { id: commitmentId },
      });
    });

    it("should throw ForbiddenError when user is not owner", async () => {
      findUniqueMock.mockResolvedValue({
        id: "commit-1",
        userId: "other-user",
        name: "Netflix",
        type: "OBLIGATION",
        description: null,
        categoryId: "cat-1",
        defaultAmount: null,
        frequency: "MONTHLY",
        startDate: new Date("2026-01-01"),
        recurrenceDay: null,
        nextDueDate: new Date("2026-02-01"),
        reminderDaysBefore: 3,
        endDate: null,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(deleteCommitment("commit-1", "hacker-user")).rejects.toMatchObject({
        statusCode: 403,
        isOperational: true,
      });
    });

    it("should throw NotFoundError when commitment does not exist", async () => {
      findUniqueMock.mockResolvedValue(null);

      await expect(deleteCommitment("nonexistent", "user-123")).rejects.toMatchObject({
        statusCode: 404,
        isOperational: true,
      });
    });
  });
});
