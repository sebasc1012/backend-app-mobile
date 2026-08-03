import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { prisma } from "./config/database";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    `🚀 Servidor corriendo en http://localhost:${env.PORT} (${env.NODE_ENV})`,
  );
});

// Apagado ordenado (graceful shutdown)
async function shutdown(signal: string) {
  logger.info(`Recibida señal ${signal}, cerrando servidor...`);

  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Servidor cerrado correctamente");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
