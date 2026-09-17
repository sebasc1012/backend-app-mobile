import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../lib/errors";
import { getUpcomingReminders } from "./reminders.service";

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) throw new BadRequestError("Usuario no autenticado");

    const reminders = await getUpcomingReminders(userId);
    res.json({ reminders });
  } catch (err) {
    next(err);
  }
};
