import { Router } from "express";
import { getProviders } from "./auth.controller";

const router = Router();

router.get("/providers", getProviders);

export default router;
