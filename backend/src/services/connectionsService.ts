import { HttpError } from "../middleware/errorHandler.js";
import { getPrisma } from "../models/prisma.js";

export type ConnectionUser = {
  id: string;
  email: string;
  name: string | null;
  credibilityScore: number;
  karmaBalance: number;
};

export type ConnectionRequestRow = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
  fromUser: ConnectionUser;
  toUser: ConnectionUser;
};

export async function createConnectionRequest(
  fromUserId: string,
  toUserId: string
): Promise<{ id: string; status: string }> {
  if (!fromUserId) throw new HttpError(401, "Unauthorized");
  if (!toUserId) throw new HttpError(400, "Missing toUserId");
  if (toUserId === fromUserId) throw new HttpError(400, "Cannot connect to self");

  const prisma = getPrisma();

  // If there is an incoming pending request, accept it instead of creating a duplicate.
  const incoming = await prisma.connectionRequest.findUnique({
    where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: fromUserId } },
    select: { id: true, status: true },
  });
  if (incoming?.status === "PENDING") {
    const updated = await prisma.connectionRequest.update({
      where: { id: incoming.id },
      data: { status: "ACCEPTED" },
      select: { id: true, status: true },
    });
    return updated;
  }

  // Upsert outgoing edge.
  const row = await prisma.connectionRequest.upsert({
    where: { fromUserId_toUserId: { fromUserId, toUserId } },
    update: { status: "PENDING" },
    create: { fromUserId, toUserId, status: "PENDING" },
    select: { id: true, status: true },
  });
  return row;
}

export async function listConnections(userId: string): Promise<{
  incoming: ConnectionRequestRow[];
  outgoing: ConnectionRequestRow[];
  connections: Array<{ user: ConnectionUser; since: Date }>;
}> {
  if (!userId) throw new HttpError(401, "Unauthorized");
  const prisma = getPrisma();

  const [incoming, outgoing, acceptedIncoming, acceptedOutgoing] =
    await Promise.all([
      prisma.connectionRequest.findMany({
        where: { toUserId: userId, status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          fromUser: {
            select: {
              id: true,
              email: true,
              name: true,
              credibilityScore: true,
              karmaBalance: true,
            },
          },
          toUser: {
            select: {
              id: true,
              email: true,
              name: true,
              credibilityScore: true,
              karmaBalance: true,
            },
          },
        },
      }),
      prisma.connectionRequest.findMany({
        where: { fromUserId: userId, status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          fromUser: {
            select: {
              id: true,
              email: true,
              name: true,
              credibilityScore: true,
              karmaBalance: true,
            },
          },
          toUser: {
            select: {
              id: true,
              email: true,
              name: true,
              credibilityScore: true,
              karmaBalance: true,
            },
          },
        },
      }),
      prisma.connectionRequest.findMany({
        where: { toUserId: userId, status: "ACCEPTED" },
        orderBy: { updatedAt: "desc" },
        take: 200,
        select: {
          id: true,
          updatedAt: true,
          fromUser: {
            select: {
              id: true,
              email: true,
              name: true,
              credibilityScore: true,
              karmaBalance: true,
            },
          },
        },
      }),
      prisma.connectionRequest.findMany({
        where: { fromUserId: userId, status: "ACCEPTED" },
        orderBy: { updatedAt: "desc" },
        take: 200,
        select: {
          id: true,
          updatedAt: true,
          toUser: {
            select: {
              id: true,
              email: true,
              name: true,
              credibilityScore: true,
              karmaBalance: true,
            },
          },
        },
      }),
    ]);

  const connections = [
    ...acceptedIncoming.map((r) => ({ user: r.fromUser, since: r.updatedAt })),
    ...acceptedOutgoing.map((r) => ({ user: r.toUser, since: r.updatedAt })),
  ].sort((a, b) => b.since.getTime() - a.since.getTime());

  return { incoming: incoming as unknown as ConnectionRequestRow[], outgoing: outgoing as unknown as ConnectionRequestRow[], connections };
}

export async function acceptConnectionRequest(
  userId: string,
  requestId: string
): Promise<{ id: string; status: string }> {
  if (!userId) throw new HttpError(401, "Unauthorized");
  const prisma = getPrisma();
  const row = await prisma.connectionRequest.findUnique({
    where: { id: requestId },
    select: { id: true, toUserId: true, status: true },
  });
  if (!row || row.toUserId !== userId) throw new HttpError(404, "Request not found");
  if (row.status !== "PENDING") return { id: row.id, status: row.status };
  const updated = await prisma.connectionRequest.update({
    where: { id: requestId },
    data: { status: "ACCEPTED" },
    select: { id: true, status: true },
  });
  return updated;
}

export async function declineConnectionRequest(
  userId: string,
  requestId: string
): Promise<{ id: string; status: string }> {
  if (!userId) throw new HttpError(401, "Unauthorized");
  const prisma = getPrisma();
  const row = await prisma.connectionRequest.findUnique({
    where: { id: requestId },
    select: { id: true, toUserId: true, status: true },
  });
  if (!row || row.toUserId !== userId) throw new HttpError(404, "Request not found");
  if (row.status !== "PENDING") return { id: row.id, status: row.status };
  const updated = await prisma.connectionRequest.update({
    where: { id: requestId },
    data: { status: "DECLINED" },
    select: { id: true, status: true },
  });
  return updated;
}

export async function cancelConnectionRequest(
  userId: string,
  requestId: string
): Promise<{ id: string; status: string }> {
  if (!userId) throw new HttpError(401, "Unauthorized");
  const prisma = getPrisma();
  const row = await prisma.connectionRequest.findUnique({
    where: { id: requestId },
    select: { id: true, fromUserId: true, status: true },
  });
  if (!row || row.fromUserId !== userId) throw new HttpError(404, "Request not found");
  if (row.status !== "PENDING") return { id: row.id, status: row.status };
  const updated = await prisma.connectionRequest.update({
    where: { id: requestId },
    data: { status: "CANCELLED" },
    select: { id: true, status: true },
  });
  return updated;
}

