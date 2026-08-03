import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { apiRouter } from "./routes/index";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();

  // Seguridad y middlewares globales
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rutas
  app.use("/api", apiRouter);

  // 404 y manejo de errores (siempre al final)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
