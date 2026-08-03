import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Cliente admin de Supabase (secret key — reemplazo del antiguo service_role).
 * Se usa SOLO en el backend para verificar tokens de usuarios y,
 * si hace falta, operaciones administrativas (crear usuarios, etc.)
 *
 * NUNCA exponer SUPABASE_SECRET_KEY al frontend.
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SECRET_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
