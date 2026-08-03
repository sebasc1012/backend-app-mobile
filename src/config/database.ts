import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env, isDevelopment } from "./env";

// Evita crear múltiples instancias de PrismaClient en desarrollo
// (por el hot-reload de ts-node-dev / nodemon)
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  global.prismaGlobal ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    log: isDevelopment ? ["query", "error", "warn"] : ["error"],
  });

if (isDevelopment) {
  global.prismaGlobal = prisma;
}
