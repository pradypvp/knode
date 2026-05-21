import type { Request, Response } from "express";
import { config } from "../config.js";
import { getPrisma } from "../models/prisma.js";

export async function getHealth(_req: Request, res: Response): Promise<void> {
  let database: "up" | "down" | "not_configured" = "not_configured";
  if (config.DATABASE_URL) {
    try {
      const prisma = getPrisma();
      await prisma.$queryRaw`SELECT 1`;
      database = "up";
    } catch {
      database = "down";
    }
  }
  res.json({
    status: "ok",
    service: "knode-backend",
    env: config.NODE_ENV,
    database,
  });
}
