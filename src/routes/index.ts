import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import usersRouter from "../modules/users/users.routes";
import categoriesRouter from "../modules/categories/categories.routes";
import commitmentsRouter from "../modules/commitments/commitments.routes";
import occurrencesRouter from "../modules/occurrences/occurrences.routes";
import paymentsRouter from "../modules/payments/payments.routes";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Endpoint protegido de prueba — valida que el middleware de auth funciona
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// A medida que se creen los módulos, se registran aquí, por ejemplo:
// import { usersRouter } from "../modules/users/users.routes";
// router.use("/users", usersRouter);

router.use("/users", usersRouter);
router.use("/categories", categoriesRouter);
router.use("/commitments", commitmentsRouter);
router.use("/occurrences", occurrencesRouter);
router.use("/payments", paymentsRouter);

export { router as apiRouter };
