import { isDevelopment } from "../config/env";

type LogMeta = Record<string, unknown>;

function timestamp() {
  return new Date().toISOString();
}

export const logger = {
  info: (message: string, meta?: LogMeta) => {
    console.log(`[INFO] ${timestamp()} - ${message}`, meta ?? "");
  },
  warn: (message: string, meta?: LogMeta) => {
    console.warn(`[WARN] ${timestamp()} - ${message}`, meta ?? "");
  },
  error: (message: string, meta?: LogMeta) => {
    console.error(`[ERROR] ${timestamp()} - ${message}`, meta ?? "");
  },
  debug: (message: string, meta?: LogMeta) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${timestamp()} - ${message}`, meta ?? "");
    }
  },
};
