import { randomUUID } from "node:crypto";
import { HttpError } from "../middleware/errorHandler.js";
import { getPrisma } from "../models/prisma.js";
import { getRedis } from "./redis.js";
import { getIo } from "../socket.js";

const SOS_QUEUE = "knode:sos:queue";
const LOCK_MINUTES = 10;

const SKILL_ALIASES: Record<string, string> = {
  "c++": "cpp",
  cxx: "cpp",
  "node.js": "nodejs",
};

function normalizeSkill(skill: string): string {
  const s = skill.trim().toLowerCase();
  return SKILL_ALIASES[s] ?? s;
}

function computeUrgencyBonus(
  baseBounty: number,
  createdAt: Date,
  deadlineAt: Date | null
): number {
  if (!deadlineAt || baseBounty <= 0) return 0;
  const now = Date.now();
  const remainingMs = deadlineAt.getTime() - now;
  const totalWindowMs = Math.max(1, deadlineAt.getTime() - createdAt.getTime());
  if (remainingMs <= 0) return Math.floor(baseBounty * 0.35);
  if (remainingMs <= totalWindowMs * 0.25) return Math.floor(baseBounty * 0.35);
  if (remainingMs <= totalWindowMs * 0.5) return Math.floor(baseBounty * 0.15);
  return 0;
}

export async function createSOS(
  userId: string,
  input: {
    title: string;
    description?: string;
    bountyKarma?: number;
    topicTag?: string;
    targetSkill: string;
    deadlineHours?: number;
  }
) {
  const prisma = getPrisma();
  const bounty = Math.max(0, Math.floor(input.bountyKarma ?? 0));
  const sos = await prisma.$transaction(async (tx) => {
    if (bounty > 0) {
      const u = await tx.user.findUnique({ where: { id: userId } });
      if (!u || u.karmaBalance < bounty) {
        throw new HttpError(400, "Insufficient karma for bounty");
      }
      const bal = u.karmaBalance - bounty;
      await tx.user.update({
        where: { id: userId },
        data: { karmaBalance: bal },
      });
      await tx.karmaLedgerEntry.create({
        data: {
          userId,
          delta: -bounty,
          balanceAfter: bal,
          reason: "SOS_BOUNTY",
          correlationId: randomUUID(),
        },
      });
    }
    return tx.sOSRequest.create({
      data: {
        userId,
        title: input.title.trim().slice(0, 200),
        description: input.description?.trim().slice(0, 2000) ?? null,
        topicTag: input.topicTag?.trim().toLowerCase().slice(0, 40) || "general",
        targetSkill: normalizeSkill(input.targetSkill).slice(0, 80),
        bountyKarma: bounty,
        deadlineAt:
          input.deadlineHours && input.deadlineHours > 0
            ? new Date(Date.now() + input.deadlineHours * 60 * 60 * 1000)
            : null,
      },
    });
  });
  const redis = getRedis();
  if (redis) {
    await redis.lpush(
      SOS_QUEUE,
      JSON.stringify({
        id: sos.id,
        userId: sos.userId,
        title: sos.title,
        createdAt: sos.createdAt.toISOString(),
      })
    );
  }
  try {
    getIo().to("sos").emit("sos:new", {
      id: sos.id,
      userId: sos.userId,
      title: sos.title,
      bountyKarma: sos.bountyKarma,
      topicTag: sos.topicTag,
      targetSkill: sos.targetSkill,
      createdAt: sos.createdAt.toISOString(),
    });
  } catch {
    /* ignore */
  }
  return sos;
}

export async function listOpenSOS(take: number, userId: string) {
  const prisma = getPrisma();
  return prisma.sOSRequest.findMany({
    where: {
      status: "OPEN",
    },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      user: {
        select: { id: true, name: true, credibilityScore: true },
      },
    },
  });
}

export async function pickSOS(sosId: string, pickerUserId: string) {
  const prisma = getPrisma();
  const row = await prisma.$transaction(async (tx) => {
    const current = await tx.sOSRequest.findUnique({
      where: { id: sosId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        pickedBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!current || current.status !== "OPEN") {
      throw new HttpError(404, "SOS not available");
    }
    if (current.userId === pickerUserId) {
      throw new HttpError(400, "Cannot pick your own SOS");
    }
    if (!current.lockHolderUserId || !current.lockExpiresAt) {
      throw new HttpError(409, "Open the SOS first to lock the bounty");
    }
    if (current.lockHolderUserId !== pickerUserId) {
      throw new HttpError(423, "SOS is locked by another helper right now");
    }
    if (current.lockExpiresAt.getTime() < Date.now()) {
      throw new HttpError(423, "Your lock expired, open SOS again to relock");
    }
    const bonus = computeUrgencyBonus(
      current.bountyKarma,
      current.createdAt,
      current.deadlineAt
    );
    const picked = await tx.sOSRequest.update({
      where: { id: sosId },
      data: {
        status: "PICKED",
        pickedByUserId: pickerUserId,
        bonusKarma: bonus,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        pickedBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (bonus > 0) {
      const helper = await tx.user.findUnique({ where: { id: pickerUserId } });
      if (helper) {
        const newBal = helper.karmaBalance + bonus;
        await tx.user.update({
          where: { id: pickerUserId },
          data: { karmaBalance: newBal },
        });
        await tx.karmaLedgerEntry.create({
          data: {
            userId: pickerUserId,
            delta: bonus,
            balanceAfter: newBal,
            reason: "SOS_URGENT_BONUS",
            correlationId: randomUUID(),
          },
        });
      }
    }
    return picked;
  });
  try {
    getIo().to("sos").emit("sos:picked", {
      id: sosId,
      pickedBy: pickerUserId,
      title: row?.title,
    });
  } catch {
    /* ignore */
  }
  return row;
}

export function sosSessionRoom(sosId: string): string {
  return `sos-session:${sosId}`;
}

export async function canAccessSosSession(
  sosId: string,
  userId: string
): Promise<boolean> {
  const prisma = getPrisma();
  const row = await prisma.sOSRequest.findUnique({
    where: { id: sosId },
    select: {
      userId: true,
      pickedByUserId: true,
      status: true,
    },
  });
  if (!row) return false;
  if (row.status === "PICKED") {
    return row.userId === userId || row.pickedByUserId === userId;
  }
  if (row.status === "OPEN") {
    return row.userId === userId;
  }
  return false;
}

export async function listSosSessionsForUser(userId: string, take: number) {
  const prisma = getPrisma();
  return prisma.sOSRequest.findMany({
    where: {
      status: "PICKED",
      OR: [{ userId }, { pickedByUserId: userId }],
    },
    orderBy: { updatedAt: "desc" },
    take,
    include: {
      user: { select: { id: true, name: true, email: true } },
      pickedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getSosByIdForUser(sosId: string, userId: string) {
  const prisma = getPrisma();
  const row = await prisma.sOSRequest.findUnique({
    where: { id: sosId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      pickedBy: { select: { id: true, name: true, email: true } },
    },
  });
  if (!row) {
    throw new HttpError(404, "SOS not found");
  }
  if (row.status === "PICKED") {
    if (row.userId !== userId && row.pickedByUserId !== userId) {
      throw new HttpError(403, "Not a participant");
    }
  } else if (row.status === "OPEN") {
    if (row.userId !== userId) {
      const helperSkills = await prisma.userSkill.findMany({
        where: { userId },
        select: { skill: true },
      });
      const hasSkill = helperSkills.some(
        (s) => normalizeSkill(s.skill) === normalizeSkill(row.targetSkill)
      );
      if (!hasSkill) {
        throw new HttpError(
          403,
          `This SOS is targeted to ${row.targetSkill}. Add matching skill to view it.`
        );
      }
      await prisma.sOSRequest.update({
        where: { id: sosId },
        data: {
          lockHolderUserId: userId,
          lockExpiresAt: new Date(Date.now() + LOCK_MINUTES * 60 * 1000),
        },
      });
      return prisma.sOSRequest.findUniqueOrThrow({
        where: { id: sosId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          pickedBy: { select: { id: true, name: true, email: true } },
        },
      });
    }
  } else if (row.status === "CLOSED") {
    if (row.userId !== userId && row.pickedByUserId !== userId) {
      throw new HttpError(403, "Not a participant");
    }
  } else {
    throw new HttpError(404, "SOS not available");
  }
  return row;
}

export async function listSosMessages(sosId: string, take: number) {
  const prisma = getPrisma();
  const rows = await prisma.sosChatMessage.findMany({
    where: { sosId },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return rows.reverse();
}

export async function postSosMessage(
  sosId: string,
  userId: string,
  body: string
) {
  const prisma = getPrisma();
  const row = await prisma.sOSRequest.findUnique({
    where: { id: sosId },
    select: { status: true, userId: true, pickedByUserId: true },
  });
  if (!row || row.status !== "PICKED") {
    throw new HttpError(400, "Chat is only available after someone accepts the SOS");
  }
  if (row.userId !== userId && row.pickedByUserId !== userId) {
    throw new HttpError(403, "Not a participant");
  }
  const trimmed = body.trim().slice(0, 8000);
  if (trimmed.length === 0) {
    throw new HttpError(400, "Message cannot be empty");
  }
  const msg = await prisma.sosChatMessage.create({
    data: {
      sosId,
      userId,
      body: trimmed,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  try {
    getIo().to(sosSessionRoom(sosId)).emit("sos:message", {
      id: msg.id,
      sosId,
      userId: msg.userId,
      body: msg.body,
      createdAt: msg.createdAt.toISOString(),
      user: msg.user,
    });
  } catch {
    /* ignore */
  }
  return msg;
}
