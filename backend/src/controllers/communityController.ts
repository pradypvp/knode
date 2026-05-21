import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import {
  createCommunityListing,
  listCommunityListings,
} from "../services/communityService.js";

const createSchema = z.object({
  category: z.enum(["HACKATHON", "DSA_ARENA", "STUDY_POD"]),
  title: z.string().min(3).max(200),
  theme: z.string().max(200).optional(),
  stack: z.array(z.string().max(40)).max(20),
  openSlots: z.number().int().min(0).max(50).optional(),
});

export async function getCommunityListings(
  req: Request,
  res: Response
): Promise<void> {
  const category = String(req.query.category ?? "");
  const take = Math.min(100, Math.max(1, Number(req.query.take) || 50));
  if (!category) {
    throw new HttpError(400, "category query required");
  }
  const items = await listCommunityListings(category, take);
  res.json({ items });
}

export async function postCommunityListing(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid request body", parsed.error.flatten());
  }
  const row = await createCommunityListing(userId, parsed.data);
  res.status(201).json({ listing: row });
}
