import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./errorHandler.js";
import { verifyAccessToken } from "../services/authService.js";

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new HttpError(401, "Missing or invalid authorization"));
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    next(new HttpError(401, "Missing or invalid authorization"));
    return;
  }
  try {
    const { sub } = verifyAccessToken(token);
    req.userId = sub;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}
