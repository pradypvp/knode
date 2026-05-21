import { HttpError } from "../middleware/errorHandler.js";
import { getPrisma } from "../models/prisma.js";

const CATEGORIES = new Set(["HACKATHON", "DSA_ARENA", "STUDY_POD"]);

export async function listCommunityListings(category: string, take: number) {
  if (!CATEGORIES.has(category)) {
    throw new HttpError(400, "Invalid category");
  }
  const prisma = getPrisma();
  return prisma.communityListing.findMany({
    where: { category },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      user: { select: { id: true, name: true, email: true, department: true } },
    },
  });
}

export async function createCommunityListing(
  userId: string,
  data: {
    category: string;
    title: string;
    theme?: string;
    stack: string[];
    openSlots?: number;
  }
) {
  if (!CATEGORIES.has(data.category)) {
    throw new HttpError(400, "Invalid category");
  }
  const title = data.title.trim();
  if (title.length < 3 || title.length > 200) {
    throw new HttpError(400, "Title must be 3–200 characters");
  }
  const prisma = getPrisma();
  return prisma.communityListing.create({
    data: {
      category: data.category,
      title,
      theme: data.theme?.trim().slice(0, 200) ?? null,
      stack: data.stack.map((s) => s.toLowerCase().trim()).filter(Boolean),
      openSlots: Math.max(0, Math.min(50, data.openSlots ?? 1)),
      userId,
    },
    include: {
      user: { select: { id: true, name: true, email: true, department: true } },
    },
  });
}
