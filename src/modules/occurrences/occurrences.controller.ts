import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../lib/errors";
import {
  generateOccurrences,
  getOccurrenceById,
  listOccurrences,
  markPaid,
} from "./occurrences.service";
import { markPaidSchema } from "./occurrences.schema";

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { commitmentId } = req.params;

    if (!userId) throw new BadRequestError("Usuario no autenticado");
    if (!commitmentId || Array.isArray(commitmentId)) throw new BadRequestError("Compromiso requerido");

    const occurrences = await listOccurrences(commitmentId, userId);
    res.json({ occurrences });
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

    const occurrence = await getOccurrenceById(id, userId);
    res.json({ occurrence });
  } catch (err) {
    next(err);
  }
};

export const generate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { commitmentId } = req.params;
    const { daysAhead } = req.query;

    if (!userId) throw new BadRequestError("Usuario no autenticado");
    if (!commitmentId || Array.isArray(commitmentId)) throw new BadRequestError("Compromiso requerido");

    const days = daysAhead ? parseInt(daysAhead as string, 10) : 90;
    if (isNaN(days) || days < 1) throw new BadRequestError("Días inválidos");

    const occurrences = await generateOccurrences(commitmentId, days);
    res.status(201).json({ occurrences });
  } catch (err) {
    next(err);
  }
};

export const markAsPaid = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) throw new BadRequestError("Usuario no autenticado");
    if (!id || Array.isArray(id)) throw new BadRequestError("ID requerido");

    const input = markPaidSchema.parse(req.body);
    const occurrence = await markPaid(id, userId, input.paidAt);
    res.json({ occurrence });
  } catch (err) {
    next(err);
  }
};
