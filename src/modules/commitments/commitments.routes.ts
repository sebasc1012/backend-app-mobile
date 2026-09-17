import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  create,
  getById,
  list,
  remove,
  update,
} from "./commitments.controller";

const router = Router();

router.get("/", requireAuth, list);
router.get("/:id", requireAuth, getById);
router.post("/", requireAuth, create);
router.patch("/:id", requireAuth, update);
router.delete("/:id", requireAuth, remove);

export default router;
