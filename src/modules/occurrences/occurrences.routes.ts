import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  generate,
  getById,
  list,
  markAsPaid,
} from "./occurrences.controller";

const router = Router();

router.get("/commitment/:commitmentId", requireAuth, list);
router.get("/:id", requireAuth, getById);
router.post("/commitment/:commitmentId/generate", requireAuth, generate);
router.patch("/:id/mark-paid", requireAuth, markAsPaid);

export default router;
