import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  AI_ENGINE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(24),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

const parsedOrigins = data.CORS_ORIGIN.split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const corsOrigins =
  parsedOrigins.length > 0 ? parsedOrigins : ["http://localhost:3000"];

/** Env plus `corsOrigins` (comma-separated `CORS_ORIGIN`). */
export const config = { ...data, corsOrigins };
