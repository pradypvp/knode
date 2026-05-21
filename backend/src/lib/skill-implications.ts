/**
 * Canonical skill slugs imply prerequisite / related skills for matching.
 * When a user selects "tensorflow", we also store "python" (etc.) so
 * matchmaking and search behave as users expect.
 */
export const SKILL_IMPLIES: Record<string, string[]> = {
  tensorflow: ["python"],
  pytorch: ["python"],
  keras: ["python"],
  "scikit-learn": ["python"],
  pandas: ["python"],
  numpy: ["python"],
  django: ["python"],
  flask: ["python"],
  fastapi: ["python"],
  opencv: ["python"],
  react: ["javascript", "html"],
  "next.js": ["javascript", "html", "react"],
  nextjs: ["javascript", "html", "react"],
  vue: ["javascript", "html"],
  angular: ["javascript", "html", "typescript"],
  svelte: ["javascript", "html"],
  nodejs: ["javascript"],
  "node.js": ["javascript"],
  express: ["javascript", "nodejs"],
  graphql: ["javascript"],
  typescript: ["javascript"],
  web3: ["javascript", "html", "solidity"],
  solidity: ["javascript"],
  ethereum: ["solidity", "web3"],
  wasm: ["javascript", "html"],
  tailwind: ["html", "css"],
  css: ["html"],
  mongodb: ["javascript"],
  postgresql: ["sql"],
  mysql: ["sql"],
  redis: ["sql"],
  docker: ["linux"],
  kubernetes: ["docker", "linux"],
  cuda: ["c"],
  pytorch_cuda: ["python", "cuda"],
  "embedded-c": ["c"],
  "embedded-systems": ["embedded-c", "microcontrollers"],
  microcontrollers: ["embedded-c", "digital-electronics"],
  iot: ["microcontrollers", "networking"],
  fpga: ["verilog", "digital-electronics"],
  vhdl: ["digital-electronics"],
  verilog: ["digital-electronics"],
  vlsi: ["digital-electronics"],
  "pcb-design": ["analog-electronics", "digital-electronics"],
  "signal-processing": ["signals-and-systems", "linear-algebra"],
  "communication-systems": ["signals-and-systems"],
  "control-systems": ["signals-and-systems", "calculus"],
};

/** Expand a set of skill names to include implied prerequisites (deduped). */
export function expandSkillNames(names: string[]): string[] {
  const out = new Set<string>();
  for (const raw of names) {
    const s = raw.toLowerCase().trim();
    if (!s) continue;
    out.add(s);
    for (const im of SKILL_IMPLIES[s] ?? []) {
      out.add(im.toLowerCase());
    }
  }
  return [...out];
}

/**
 * When saving user skills, merge explicit rows with implied skills.
 * Implied proficiency is max(1, explicit - 1) unless already higher.
 */
export function expandSkillsForStorage(
  items: { skill: string; proficiency: number }[]
): { skill: string; proficiency: number }[] {
  const merged = new Map<string, number>();
  const normalized = items.map((it) => ({
    skill: it.skill.toLowerCase().trim(),
    proficiency: it.proficiency,
  }));
  for (const it of normalized) {
    merged.set(it.skill, Math.max(merged.get(it.skill) ?? 0, it.proficiency));
    for (const implied of SKILL_IMPLIES[it.skill] ?? []) {
      const im = implied.toLowerCase();
      const impliedProf = Math.max(1, Math.min(5, it.proficiency - 1));
      merged.set(im, Math.max(merged.get(im) ?? 0, impliedProf));
    }
  }
  return [...merged.entries()].map(([skill, proficiency]) => ({
    skill,
    proficiency,
  }));
}
