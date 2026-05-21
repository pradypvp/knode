import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import { findMatches } from "../services/matchmakingService.js";

const findSchema = z.object({
  skills: z.array(z.string()).min(1).max(20),
  goal: z.string().max(40).optional(),
});

export async function postFind(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const parsed = findSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid request body", parsed.error.flatten());
  }
  const out = await findMatches(userId, parsed.data.skills, parsed.data.goal);
  res.json(out);
}
