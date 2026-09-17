import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../lib/errors";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  listCategories,
  updateCategory,
} from "./categories.service";
import { createCategorySchema, updateCategorySchema } from "./categories.schema";

export const list = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await listCategories();
    res.json({ categories });
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

    if (!id || Array.isArray(id)) {
      throw new BadRequestError("ID de categoría requerido");
    }

    const category = await getCategoryById(id);
    res.json({ category });
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
    const input = createCategorySchema.parse(req.body);
    const category = await createCategory(input);
    res.status(201).json({ category });
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

    if (!id || Array.isArray(id)) {
      throw new BadRequestError("ID de categoría requerido");
    }

    const input = updateCategorySchema.parse(req.body);
    const category = await updateCategory(id, input);
    res.json({ category });
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

    if (!id || Array.isArray(id)) {
      throw new BadRequestError("ID de categoría requerido");
    }

    await deleteCategory(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
