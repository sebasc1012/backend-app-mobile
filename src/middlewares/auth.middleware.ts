import type { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { UnauthorizedError } from "../lib/errors.js";

// Extendemos el tipo Request de Express para incluir el usuario autenticado
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string | undefined;
      };
    }
  }
}

/**
 * Middleware que valida el JWT enviado en el header Authorization: Bearer <token>
 * contra Supabase Auth, y adjunta el usuario al request.
 *
 * Uso: router.get("/perfil", requireAuth, controller.getPerfil)
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token de autenticación no proporcionado");
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedError("Token inválido o expirado");
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Versión opcional: no falla si no hay token, pero adjunta el usuario si existe.
 * Útil para endpoints públicos que cambian de comportamiento si el usuario está logueado.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const { data } = await supabaseAdmin.auth.getUser(token);

    if (data.user) {
      req.user = { id: data.user.id, email: data.user.email };
    }

    next();
  } catch (err) {
    next(err);
  }
}
