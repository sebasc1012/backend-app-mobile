import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import usersRouter from "../modules/users/users.routes";

const router = Router();

// Endpoint protegido de prueba — valida que el middleware de auth funciona
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// A medida que se creen los módulos, se registran aquí, por ejemplo:
// import { usersRouter } from "../modules/users/users.routes";
// router.use("/users", usersRouter);

router.use("/users", usersRouter);




export { router as apiRouter };
