import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import { recordSessionComplete } from "../services/credibilityService.js";

const sessionSchema = z.object({
  peerUserId: z.string().uuid(),
});

export async function postSession(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const parsed = sessionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid request body", parsed.error.flatten());
  }
  const result = await recordSessionComplete(userId, parsed.data.peerUserId);
  res.json(result);
}
