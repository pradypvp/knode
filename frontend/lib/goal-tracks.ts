export const GOAL_OPTIONS = [
  { id: "developer", label: "Developer" },
  { id: "researcher", label: "Researcher" },
  { id: "dsa", label: "DSA / Competitive Programming" },
  { id: "aiml", label: "AI / ML Engineer" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "product", label: "Product / PM + Analytics" },
  { id: "electronics", label: "Electronics Core (ECE)" },
  { id: "embedded", label: "Embedded Systems / IoT" },
  { id: "ece-cs-hybrid", label: "ECE + Computer Science Hybrid" },
] as const;

export type GoalId = (typeof GOAL_OPTIONS)[number]["id"];

