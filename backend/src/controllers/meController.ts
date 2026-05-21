import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import { CAREER_GOAL_OPTIONS } from "../lib/goal-tracks.js";
import { getPrisma } from "../models/prisma.js";

const userSelect = {
  id: true,
  email: true,
  name: true,
  credibilityScore: true,
  karmaBalance: true,
  department: true,
  year: true,
  bio: true,
  careerGoal: true,
  interests: true,
  projects: true,
  createdAt: true,
  updatedAt: true,
  skills: {
    orderBy: { skill: "asc" as const },
    select: { skill: true, proficiency: true },
  },
} as const;

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  department: z.string().max(80).nullable().optional(),
  year: z.number().int().min(1).max(8).nullable().optional(),
  bio: z.string().max(4000).nullable().optional(),
  careerGoal: z
    .string()
    .nullable()
    .optional()
    .refine(
      (v) => v == null || CAREER_GOAL_OPTIONS.includes(v as (typeof CAREER_GOAL_OPTIONS)[number]),
      "Invalid career goal"
    ),
  interests: z.array(z.string().max(80)).max(40).optional(),
  projects: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
      })
    )
    .max(30)
    .optional(),
});

export async function getMe(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });
  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }
  res.json({ user });
}

export async function patchMe(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid request body", parsed.error.flatten());
  }
  const data = parsed.data;
  const prisma = getPrisma();
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.department !== undefined ? { department: data.department } : {}),
      ...(data.year !== undefined ? { year: data.year } : {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.careerGoal !== undefined ? { careerGoal: data.careerGoal } : {}),
      ...(data.interests !== undefined
        ? { interests: data.interests as object }
        : {}),
      ...(data.projects !== undefined
        ? { projects: data.projects as object }
        : {}),
    },
    select: userSelect,
  });
  res.json({ user });
}
