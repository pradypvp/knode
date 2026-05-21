import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import {
  createSOS,
  getSosByIdForUser,
  listOpenSOS,
  listSosMessages,
  listSosSessionsForUser,
  pickSOS,
  postSosMessage,
} from "../services/sosService.js";

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  topicTag: z.string().min(2).max(40).optional(),
  targetSkill: z.string().min(1).max(80),
  deadlineHours: z.number().min(0.5).max(48).optional(),
  bountyKarma: z.number().int().min(0).max(1_000_000).optional(),
});

export async function getSosList(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const list = await listOpenSOS(50, userId);
  res.json({
    items: list.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      topicTag: s.topicTag,
      targetSkill: s.targetSkill,
      bountyKarma: s.bountyKarma,
      bonusKarma: s.bonusKarma,
      deadlineAt: s.deadlineAt,
      lockExpiresAt: s.lockExpiresAt,
      lockHolderUserId: s.lockHolderUserId,
      createdAt: s.createdAt,
      author: s.user,
    })),
  });
}

export async function postSos(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid request body", parsed.error.flatten());
  }
  const sos = await createSOS(userId, parsed.data);
  res.status(201).json({ sos });
}

export async function patchSosPick(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const id = req.params.id;
  if (!id || typeof id !== "string") {
    throw new HttpError(400, "Invalid id");
  }
  const row = await pickSOS(id, userId);
  res.json({ sos: row });
}

export async function getSosSessions(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const take = Math.min(50, Math.max(1, Number(req.query.take) || 20));
  const rows = await listSosSessionsForUser(userId, take);
  res.json({
    items: rows.map((s) => ({
      id: s.id,
      title: s.title,
      status: s.status,
      createdAt: s.createdAt,
      author: s.user,
      helper: s.pickedBy,
      role: s.userId === userId ? "author" : "helper",
    })),
  });
}

export async function getSosOne(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const id = req.params.id;
  if (!id) {
    throw new HttpError(400, "Invalid id");
  }
  const row = await getSosByIdForUser(id, userId);
  res.json({
    sos: {
      id: row.id,
      title: row.title,
      description: row.description,
      topicTag: row.topicTag,
      targetSkill: row.targetSkill,
      bountyKarma: row.bountyKarma,
      bonusKarma: row.bonusKarma,
      deadlineAt: row.deadlineAt,
      lockExpiresAt: row.lockExpiresAt,
      lockHolderUserId: row.lockHolderUserId,
      status: row.status,
      createdAt: row.createdAt,
      author: row.user,
      pickedBy: row.pickedBy,
    },
  });
}

export async function getSosMessagesHttp(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const id = req.params.id;
  if (!id) {
    throw new HttpError(400, "Invalid id");
  }
  await getSosByIdForUser(id, userId);
  const take = Math.min(200, Math.max(1, Number(req.query.take) || 100));
  const msgs = await listSosMessages(id, take);
  res.json({
    messages: msgs.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt,
      user: m.user,
    })),
  });
}

const messageSchema = z.object({
  body: z.string().min(1).max(8000),
});

export async function postSosMessageHttp(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const id = req.params.id;
  if (!id) {
    throw new HttpError(400, "Invalid id");
  }
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid request body", parsed.error.flatten());
  }
  const msg = await postSosMessage(id, userId, parsed.data.body);
  res.status(201).json({
    message: {
      id: msg.id,
      body: msg.body,
      createdAt: msg.createdAt,
      user: msg.user,
    },
  });
}
