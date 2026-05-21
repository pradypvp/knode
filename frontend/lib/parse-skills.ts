export function parseSkillsRaw(input: string): {
  skill: string;
  proficiency: number;
}[] {
  const parts = input
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: { skill: string; proficiency: number }[] = [];
  for (const part of parts) {
    const [name, lvlRaw] = part.split(":").map((s) => s.trim());
    if (!name) continue;
    const n = parseInt(lvlRaw ?? "3", 10);
    const proficiency = Number.isFinite(n)
      ? Math.min(5, Math.max(1, n))
      : 3;
    out.push({ skill: name.toLowerCase(), proficiency });
  }
  return out;
}

export function formatSkillsRaw(
  skills: { skill: string; proficiency: number }[]
): string {
  return skills.map((s) => `${s.skill}:${s.proficiency}`).join(", ");
}
