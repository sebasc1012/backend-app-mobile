import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env, isDevelopment } from "./env";

// Evita crear múltiples instancias de PrismaClient en desarrollo
// (por el hot-reload de ts-node-dev / nodemon)
declare global {
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
