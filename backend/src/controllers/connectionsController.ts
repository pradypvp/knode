import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import {
  acceptConnectionRequest,
  cancelConnectionRequest,
  createConnectionRequest,
  declineConnectionRequest,
  listConnections,
} from "../services/connectionsService.js";

const createSchema = z.object({
  toUserId: z.string().min(1),
});

export async function getConnections(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) throw new HttpError(401, "Unauthorized");
  const data = await listConnections(userId);
  res.json(data);
}

export async function postRequest(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) throw new HttpError(401, "Unauthorized");
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid request body", parsed.error.flatten());
  }
  const out = await createConnectionRequest(userId, parsed.data.toUserId);
  res.json(out);
}

export async function postAccept(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) throw new HttpError(401, "Unauthorized");
  const id = req.params.id;
  const out = await acceptConnectionRequest(userId, id);
  res.json(out);
}

export async function postDecline(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) throw new HttpError(401, "Unauthorized");
  const id = req.params.id;
  const out = await declineConnectionRequest(userId, id);
  res.json(out);
}

export async function postCancel(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) throw new HttpError(401, "Unauthorized");
  const id = req.params.id;
  const out = await cancelConnectionRequest(userId, id);
  res.json(out);
}

