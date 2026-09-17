import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  create,
  getById,
  list,
  remove,
  update,
} from "./categories.controller";

const router = Router();

router.get("/", list);
router.get("/:id", getById);
router.post("/", requireAuth, create);
router.patch("/:id", requireAuth, update);
router.delete("/:id", requireAuth, remove);

export default router;
