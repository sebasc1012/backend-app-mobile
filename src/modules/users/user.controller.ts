import type { NextFunction, Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../../lib/errors";
import {
  getUserProfile as getProfileByUserId,
  softDeleteUserProfile,
  updateUserProfile,
  upsertUserProfile,
} from "./user.service";
import { updateProfileSchema, upsertProfileSchema } from "./users.schema";

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Usuario no autenticado");
    }

    const profile = await getProfileByUserId(req.user.id);

    if (!profile) {
      throw new NotFoundError("Perfil no encontrado");
    }

    res.json({ profile });
  } catch (err) {
    next(err);
  }
};

export const upsertProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Usuario no autenticado");
    }

    const input = upsertProfileSchema.parse(req.body);
    const profile = await upsertUserProfile(req.user.id, input);

    res.status(200).json({ profile });
  } catch (err) {
    next(err);
  }
};

export const deleteUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Usuario no autenticado");
    }

    await softDeleteUserProfile(req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Usuario no autenticado");
    }

    const input = updateProfileSchema.parse(req.body);
    const profile = await updateUserProfile(req.user.id, input);

    res.json({ profile });
  } catch (err) {
    next(err);
  }
};
