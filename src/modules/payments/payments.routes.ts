import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  create,
  getById,
  list,
} from "./payments.controller";

const router = Router();

router.get("/commitment/:commitmentId", requireAuth, list);
router.get("/:id", requireAuth, getById);
router.post("/", requireAuth, create);

export default router;
