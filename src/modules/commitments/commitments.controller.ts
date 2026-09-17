import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../lib/errors";
import {
  createCommitment,
  deleteCommitment,
  getCommitmentById,
  listCommitments,
  updateCommitment,
} from "./commitments.service";
import {
  createCommitmentSchema,
  updateCommitmentSchema,
} from "./commitments.schema";

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError("Usuario no autenticado");
    }

    const commitments = await listCommitments(userId);
    res.json({ commitments });
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
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestError("Usuario no autenticado");
    }

    if (!id || Array.isArray(id)) {
      throw new BadRequestError("ID de compromiso requerido");
    }

    const commitment = await getCommitmentById(id, userId);
    res.json({ commitment });
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

    if (!userId) {
      throw new BadRequestError("Usuario no autenticado");
    }

    const input = createCommitmentSchema.parse(req.body);
    const commitment = await createCommitment(userId, input);
    res.status(201).json({ commitment });
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestError("Usuario no autenticado");
    }

    if (!id || Array.isArray(id)) {
      throw new BadRequestError("ID de compromiso requerido");
    }

    const input = updateCommitmentSchema.parse(req.body);
    const commitment = await updateCommitment(id, userId, input);
    res.json({ commitment });
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestError("Usuario no autenticado");
    }

    if (!id || Array.isArray(id)) {
      throw new BadRequestError("ID de compromiso requerido");
    }

    await deleteCommitment(id, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
