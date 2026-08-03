import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";
import { isDevelopment } from "../config/env";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Errores de validación de Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: "Error de validación",
        details: err.flatten().fieldErrors,
      },
    });
  }

  // Errores de negocio conocidos (AppError y subclases)
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error(err.message, { stack: err.stack });
    }

    return res.status(err.statusCode).json({
      error: { message: err.message },
    });
  }

  // Errores inesperados
  const message =
    err instanceof Error ? err.message : "Error interno del servidor";
  const stack = err instanceof Error ? err.stack : undefined;

  logger.error("Error no controlado", { message, stack });

  return res.status(500).json({
    error: {
      message: "Error interno del servidor",
      ...(isDevelopment && { debug: message }),
    },
  });
}
