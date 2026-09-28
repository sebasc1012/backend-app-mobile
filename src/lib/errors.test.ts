import { jest, describe, it, expect } from "@jest/globals";
import type { Request, Response } from "express";

jest.unstable_mockModule("../config/env", () => ({
  isDevelopment: false,
}));

const {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  ConflictError,
} = await import("./errors");
const { errorHandler } = await import("../middlewares/error.middleware");

const cases = [
  [UnauthorizedError, 401],
  [ForbiddenError, 403],
  [NotFoundError, 404],
  [BadRequestError, 400],
  [ConflictError, 409],
] as const;

describe("AppError subclasses", () => {
  it.each(cases)("%p keeps instanceof, name and statusCode", (Cls, status) => {
    const err = new Cls();
    expect(err).toBeInstanceOf(Cls);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe(Cls.name);
    expect(err.statusCode).toBe(status);
  });

  it.each(cases)("errorHandler maps %p to its status", (Cls, status) => {
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })) } as unknown as Response;
    errorHandler(new Cls("boom"), {} as Request, res, () => {});
    expect(res.status).toHaveBeenCalledWith(status);
    expect(json).toHaveBeenCalledWith({ error: { message: "boom" } });
  });
});
