import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3000),

  // Base de datos
  DATABASE_URL: z
    .string()
    .url({ message: "DATABASE_URL debe ser una URL válida de PostgreSQL" }),

  // Supabase (nuevo esquema de keys: publishable/secret, reemplaza anon/service_role)
  SUPABASE_URL: z
    .string()
    .url({ message: "SUPABASE_URL debe ser una URL válida" }),
  SUPABASE_SECRET_KEY: z.string().min(1, "SUPABASE_SECRET_KEY es requerido"),
  SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "SUPABASE_PUBLISHABLE_KEY es requerido"),

  // CORS
  CORS_ORIGIN: z.string().default("*"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Variables de entorno inválidas:");
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";
