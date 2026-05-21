import { expandSkillNames } from "../lib/skill-implications.js";
import {
  GOAL_SKILL_TRACKS,
  normalizeCareerGoal,
  type CareerGoal,
} from "../lib/goal-tracks.js";
import { config } from "../config.js";
import { getPrisma } from "../models/prisma.js";

type CandidateRow = {
  id: string;
  name: string | null;
  credibilityScore: number;
  karmaBalance: number;
  skills: { skill: string; proficiency: number }[];
};

function toPercentScores<T extends { score: number }>(
  rows: T[]
): Array<T & { rawScore: number }> {
  if (rows.length === 0) return [];

  // Use a distribution-based normalization so the % stays stable even when the
  // candidate set is small. We map z-scores through a sigmoid into 0–100%.
  const scores = rows.map((r) => r.score);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((acc, s) => acc + (s - mean) * (s - mean), 0) /
    Math.max(1, scores.length);
  const std = Math.sqrt(variance);

  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

  // If everything is basically identical, call it a neutral 50%.
  if (std <= 1e-6) {
    return rows.map((r) => ({ ...r, rawScore: r.score, score: 50 }));
  }

  return rows.map((r) => {
    const z = (r.score - mean) / std;
    const pct = sigmoid(z) * 100;
    const capped = Math.max(0, Math.min(100, pct));
    return { ...r, rawScore: r.score, score: capped };
  });
}

function localScore(
  c: CandidateRow,
  normalized: string[],
  overlap: number
): number {
  return (
    overlap * 12 +
    c.credibilityScore * 0.4 +
    c.karmaBalance * 0.02
  );
}

function uniqueCleanSkills(skills: string[]): string[] {
  return [...new Set(skills.map((s) => s.toLowerCase().trim()).filter(Boolean))];
}

function skillsForGoal(goal: CareerGoal): string[] {
  return expandSkillNames([...GOAL_SKILL_TRACKS[goal]]);
}

function buildGoalScopedSeekerSkills(
  requestedSkills: string[],
  goal: CareerGoal | null
): string[] {
  const expandedRequested = expandSkillNames(uniqueCleanSkills(requestedSkills));
  if (!goal) return expandedRequested;

  const allowed = new Set(skillsForGoal(goal));
  const filtered = expandedRequested.filter((s) => allowed.has(s));

  // If user didn't provide relevant skills, fall back to the goal track itself.
  return filtered.length > 0 ? filtered : [...allowed];
}

export async function findMatches(
  userId: string,
  skills: string[],
  goalHint?: string
) {
  const prisma = getPrisma();
  const seeker = await prisma.user.findUnique({
    where: { id: userId },
    select: { careerGoal: true },
  });
  const goal = normalizeCareerGoal(goalHint) ?? normalizeCareerGoal(seeker?.careerGoal);
  const normalizedPrimary = buildGoalScopedSeekerSkills(skills, goal);
  if (normalizedPrimary.length === 0) {
    return { matches: [], goalUsed: goal, targetSkills: normalizedPrimary };
  }

  const loadCandidates = async (targetSkills: string[]) =>
    (await prisma.user.findMany({
      where: {
        id: { not: userId },
        skills: { some: { skill: { in: targetSkills } } },
      },
      select: {
        id: true,
        name: true,
        credibilityScore: true,
        karmaBalance: true,
        skills: {
          take: 20,
          select: { skill: true, proficiency: true },
        },
      },
      orderBy: [{ credibilityScore: "desc" }, { karmaBalance: "desc" }],
      take: 30,
    })) as CandidateRow[];

  let targetSkills = normalizedPrimary;
  let candidates = await loadCandidates(targetSkills);

  // Fallback: if strict goal-scope yields nobody, try broader requested skills.
  if (candidates.length === 0 && goal) {
    const normalizedFallback = expandSkillNames(uniqueCleanSkills(skills));
    if (normalizedFallback.length > 0) {
      candidates = await loadCandidates(normalizedFallback);
      if (candidates.length > 0) {
        targetSkills = normalizedFallback;
      }
    }
  }

  if (config.AI_ENGINE_URL && candidates.length > 0) {
    try {
      const res = await fetch(`${config.AI_ENGINE_URL}/match/rank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seekerSkills: targetSkills,
          candidates: candidates.map((c) => ({
            userId: c.id,
            skills: c.skills.map((s) => s.skill),
            credibility: c.credibilityScore,
            karma: c.karmaBalance,
            skillLevels: c.skills.map((s) => ({
              skill: s.skill,
              proficiency: s.proficiency,
            })),
          })),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          ranked: Array<{
            userId: string;
            score: number;
            coverage: number;
            bridging: number;
            raw_overlap: number;
          }>;
        };
        const byId = new Map(candidates.map((c) => [c.id, c]));
        const out = data.ranked
          .map((r) => {
            const c = byId.get(r.userId);
            if (!c) return null;
            const overlap = c.skills.filter((sk) =>
              targetSkills.includes(sk.skill)
            ).length;
            return {
              userId: r.userId,
              name: c.name,
              credibilityScore: c.credibilityScore,
              karmaBalance: c.karmaBalance,
              skills: c.skills,
              overlap,
              score: r.score,
              coverage: r.coverage,
              bridging: r.bridging,
              rawOverlap: r.raw_overlap,
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);
        return {
          matches: toPercentScores(out).slice(0, 20),
          goalUsed: goal,
          targetSkills,
        };
      }
    } catch {
      /* fall through */
    }
  }

  const scored = candidates.map((c) => {
    const overlap = c.skills.filter((sk) =>
      targetSkills.includes(sk.skill)
    ).length;
    return {
      userId: c.id,
      name: c.name,
      credibilityScore: c.credibilityScore,
      karmaBalance: c.karmaBalance,
      skills: c.skills,
      overlap,
      score: localScore(c, targetSkills, overlap),
      coverage: overlap / Math.max(1, targetSkills.length),
      bridging: 0,
      rawOverlap: overlap,
    };
  });
  scored.sort((a, b) => b.score - a.score);
  return {
    matches: toPercentScores(scored).slice(0, 20),
    goalUsed: goal,
    targetSkills,
  };
}
