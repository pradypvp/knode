import { expandSkillsForStorage } from "../lib/skill-implications.js";
import { HttpError } from "../middleware/errorHandler.js";
import { getPrisma } from "../models/prisma.js";

export async function replaceSkills(
  userId: string,
  items: { skill: string; proficiency: number }[]
) {
  for (const it of items) {
    if (
      !Number.isInteger(it.proficiency) ||
      it.proficiency < 1 ||
      it.proficiency > 5
    ) {
      throw new HttpError(400, "Proficiency must be 1–5");
    }
    if (it.skill.trim().length === 0 || it.skill.length > 80) {
      throw new HttpError(400, "Invalid skill name");
    }
  }
  const prisma = getPrisma();
  const normalized = items.map((it) => ({
    skill: it.skill.toLowerCase().trim(),
    proficiency: it.proficiency,
  }));
  const merged = new Map<string, number>();
  for (const n of normalized) {
    merged.set(n.skill, Math.max(merged.get(n.skill) ?? 0, n.proficiency));
  }
  const deduped = expandSkillsForStorage(
    [...merged.entries()].map(([skill, proficiency]) => ({
      skill,
      proficiency,
    }))
  );
  await prisma.$transaction(async (tx) => {
    await tx.userSkill.deleteMany({ where: { userId } });
    for (const n of deduped) {
      await tx.userSkill.create({
        data: {
          userId,
          skill: n.skill,
          proficiency: n.proficiency,
        },
      });
    }
  });
  return prisma.userSkill.findMany({
    where: { userId },
    orderBy: { skill: "asc" },
  });
}

export async function listSkills(userId: string) {
  const prisma = getPrisma();
  return prisma.userSkill.findMany({
    where: { userId },
    orderBy: { skill: "asc" },
  });
}
