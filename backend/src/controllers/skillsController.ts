import type { Request, Response } from "express";
import { z } from "zod";
import { SKILL_IMPLIES } from "../lib/skill-implications.js";
import { HttpError } from "../middleware/errorHandler.js";
import { listSkills, replaceSkills } from "../services/skillsService.js";

const putSchema = z.object({
  skills: z
    .array(
      z.object({
        skill: z.string(),
        proficiency: z.number().int(),
      })
    )
    .max(40),
});

export async function getSkillImplications(
  _req: Request,
  res: Response
): Promise<void> {
  res.json({ implies: SKILL_IMPLIES });
}

export async function getSkillsMe(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const skills = await listSkills(userId);
  res.json({ skills });
}

export async function putSkillsMe(req: Request, res: Response): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const parsed = putSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid request body", parsed.error.flatten());
  }
  const skills = await replaceSkills(userId, parsed.data.skills);
  res.json({ skills });
}
