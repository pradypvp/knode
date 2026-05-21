import { randomUUID } from "node:crypto";
import { HttpError } from "../middleware/errorHandler.js";
import { getPrisma } from "../models/prisma.js";

export async function transferKarma(
  fromUserId: string,
  toUserId: string,
  amount: number,
  clientKey?: string
): Promise<{
  ok: boolean;
  fromBalance: number;
  toBalance: number;
  correlationId: string;
}> {
  if (fromUserId === toUserId) {
    throw new HttpError(400, "Cannot transfer to yourself");
  }
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new HttpError(400, "Amount must be a positive integer");
  }
  const prisma = getPrisma();
  if (clientKey) {
    const existing = await prisma.karmaIdempotency.findUnique({
      where: {
        userId_clientKey: { userId: fromUserId, clientKey },
      },
    });
    if (existing) {
      return existing.payload as {
        ok: boolean;
        fromBalance: number;
        toBalance: number;
        correlationId: string;
      };
    }
  }
  const correlationId = randomUUID();
  return prisma.$transaction(async (tx) => {
    const from = await tx.user.findUnique({ where: { id: fromUserId } });
    const to = await tx.user.findUnique({ where: { id: toUserId } });
    if (!from || !to) {
      throw new HttpError(404, "User not found");
    }
    if (from.karmaBalance < amount) {
      throw new HttpError(400, "Insufficient karma");
    }
    const fromBal = from.karmaBalance - amount;
    const toBal = to.karmaBalance + amount;
    await tx.user.update({
      where: { id: fromUserId },
      data: { karmaBalance: fromBal },
    });
    await tx.user.update({
      where: { id: toUserId },
      data: { karmaBalance: toBal },
    });
    await tx.karmaLedgerEntry.createMany({
      data: [
        {
          userId: fromUserId,
          delta: -amount,
          balanceAfter: fromBal,
          reason: "TRANSFER_OUT",
          counterpartyId: toUserId,
          correlationId,
        },
        {
          userId: toUserId,
          delta: amount,
          balanceAfter: toBal,
          reason: "TRANSFER_IN",
          counterpartyId: fromUserId,
          correlationId,
        },
      ],
    });
    const result = {
      ok: true,
      fromBalance: fromBal,
      toBalance: toBal,
      correlationId,
    };
    if (clientKey) {
      await tx.karmaIdempotency.create({
        data: {
          userId: fromUserId,
          clientKey,
          payload: result,
        },
      });
    }
    return result;
  });
}

export async function listLedger(userId: string, take: number) {
  const prisma = getPrisma();
  return prisma.karmaLedgerEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}
