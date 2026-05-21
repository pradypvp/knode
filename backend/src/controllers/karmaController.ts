import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import { listLedger, transferKarma } from "../services/karmaService.js";

const transferSchema = z.object({
  toUserId: z.string().uuid(),
  amount: z.number().int().positive(),
  clientKey: z.string().min(8).max(120).optional(),
});

export async function postTransfer(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const parsed = transferSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid request body", parsed.error.flatten());
  }
  const result = await transferKarma(
    userId,
    parsed.data.toUserId,
    parsed.data.amount,
    parsed.data.clientKey
  );
  res.json(result);
}

export async function getLedger(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const take = Math.min(100, Math.max(1, Number(req.query.take) || 50));
  const entries = await listLedger(userId, take);
  res.json({ entries });
}
