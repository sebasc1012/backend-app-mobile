import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  deleteUserProfile,
  getUserProfile,
  updateProfile,
  upsertProfile,
} from "./user.controller";

const userRouter = Router();


userRouter.get("/profile", requireAuth, getUserProfile);
userRouter.post("/profile", requireAuth, upsertProfile);
userRouter.patch("/profile", requireAuth, updateProfile);
userRouter.delete("/profile", requireAuth, deleteUserProfile);

export default userRouter;
