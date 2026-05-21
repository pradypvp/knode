import { HttpError } from "../middleware/errorHandler.js";
import { getPrisma } from "../models/prisma.js";

const BUMP = 2;
const CAP = 100;

export async function recordSessionComplete(
  userId: string,
  peerUserId: string
): Promise<{ userScore: number; peerScore: number }> {
  if (userId === peerUserId) {
    throw new HttpError(400, "Invalid peer");
  }
  const prisma = getPrisma();
  return prisma.$transaction(async (tx) => {
    const [a, b] = await Promise.all([
      tx.user.findUnique({ where: { id: userId } }),
      tx.user.findUnique({ where: { id: peerUserId } }),
    ]);
    if (!a || !b) {
      throw new HttpError(404, "User not found");
    }
    const userScore = Math.min(CAP, a.credibilityScore + BUMP);
    const peerScore = Math.min(CAP, b.credibilityScore + BUMP);
    await tx.user.update({
      where: { id: userId },
      data: { credibilityScore: userScore },
    });
    await tx.user.update({
      where: { id: peerUserId },
      data: { credibilityScore: peerScore },
    });
    return { userScore, peerScore };
  });
}
