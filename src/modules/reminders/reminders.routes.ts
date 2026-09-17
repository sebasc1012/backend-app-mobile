import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { list } from "./reminders.controller";

const router = Router();

router.get("/", requireAuth, list);

export default router;
