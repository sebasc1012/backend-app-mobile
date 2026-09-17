import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../lib/errors";
import {
  createPayment,
  getPaymentById,
  listPayments,
} from "./payments.service";
import { createPaymentSchema } from "./payments.schema";

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { commitmentId } = req.params;

    if (!userId) throw new BadRequestError("Usuario no autenticado");
    if (!commitmentId || Array.isArray(commitmentId))
      throw new BadRequestError("Compromiso requerido");

    const payments = await listPayments(commitmentId, userId);
    res.json({ payments });
  } catch (err) {
    next(err);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) throw new BadRequestError("Usuario no autenticado");
    if (!id || Array.isArray(id)) throw new BadRequestError("ID requerido");

    const payment = await getPaymentById(id, userId);
    res.json({ payment });
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) throw new BadRequestError("Usuario no autenticado");

    const input = createPaymentSchema.parse(req.body);
    const payment = await createPayment(
      userId,
      input.occurrenceId,
      input.paidAmount,
      input.paidAt,
    );
    res.status(201).json({ payment });
  } catch (err) {
    next(err);
  }
};
