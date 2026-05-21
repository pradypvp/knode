export const GOAL_SKILL_TRACKS = {
  developer: [
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "express",
    "postgresql",
    "sql",
    "docker",
    "redis",
  ],
  researcher: [
    "python",
    "pytorch",
    "tensorflow",
    "scikit-learn",
    "numpy",
    "pandas",
    "statistics",
    "linear-algebra",
    "graphs",
  ],
  dsa: ["dsa", "graphs", "dynamic-programming", "c", "cpp", "python", "math"],
  aiml: [
    "python",
    "pytorch",
    "tensorflow",
    "scikit-learn",
    "numpy",
    "pandas",
    "opencv",
  ],
  cybersecurity: [
    "linux",
    "networking",
    "cryptography",
    "python",
    "c",
    "web-security",
  ],
  product: ["ui-ux", "communication", "analytics", "sql", "figma", "react"],
  electronics: [
    "digital-electronics",
    "analog-electronics",
    "signals-and-systems",
    "signal-processing",
    "communication-systems",
    "control-systems",
    "vlsi",
    "verilog",
    "fpga",
    "pcb-design",
  ],
  embedded: [
    "embedded-c",
    "microcontrollers",
    "embedded-systems",
    "iot",
    "digital-electronics",
    "linux",
    "c",
    "signal-processing",
  ],
  "ece-cs-hybrid": [
    "digital-electronics",
    "signals-and-systems",
    "embedded-c",
    "microcontrollers",
    "python",
    "c",
    "dsa",
    "iot",
    "opencv",
  ],
} as const;

export type CareerGoal = keyof typeof GOAL_SKILL_TRACKS;

export const CAREER_GOAL_OPTIONS: CareerGoal[] = Object.keys(
  GOAL_SKILL_TRACKS
) as CareerGoal[];

export function normalizeCareerGoal(input?: string | null): CareerGoal | null {
  if (!input) return null;
  const key = input.trim().toLowerCase();
  if (key in GOAL_SKILL_TRACKS) {
    return key as CareerGoal;
  }
  return null;
}

