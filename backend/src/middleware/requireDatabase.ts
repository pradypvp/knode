import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { HttpError } from "./errorHandler.js";

export function requireDatabase(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!config.DATABASE_URL) {
    next(new HttpError(503, "Database not configured"));
    return;
  }
  next();
}
