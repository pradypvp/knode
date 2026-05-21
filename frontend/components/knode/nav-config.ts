export type NavId =
  | "dashboard"
  | "profile"
  | "sos"
  | "match"
  | "connections"
  | "skills"
  | "hackathon"
  | "dsa"
  | "pods"
  | "ledger"
  | "engine"
  | "ai";

export const NAV_SECTIONS: {
  section: string;
  items: { id: NavId; icon: string; label: string; href: string; badge?: string; badgeVariant?: "red" | "green" }[];
}[] = [
  {
    section: "Core",
    items: [
      { id: "dashboard", icon: "◈", label: "Dashboard", href: "/dashboard" },
      { id: "profile", icon: "○", label: "Profile", href: "/profile" },
      { id: "sos", icon: "⚡", label: "SOS Queue", href: "/sos", badge: "3", badgeVariant: "red" },
      { id: "match", icon: "◎", label: "Matchmaker", href: "/match" },
      { id: "connections", icon: "⟡", label: "Connections", href: "/connections" },
      { id: "skills", icon: "✧", label: "Skills", href: "/skills" },
    ],
  },
  {
    section: "Pods",
    items: [
      { id: "hackathon", icon: "⬡", label: "Hackathon", href: "/hackathon", badge: "2", badgeVariant: "green" },
      { id: "dsa", icon: "◇", label: "DSA Arena", href: "/dsa" },
      { id: "pods", icon: "▣", label: "Study Pods", href: "/pods" },
    ],
  },
  {
    section: "Economy",
    items: [
      { id: "ledger", icon: "◈", label: "Karma Ledger", href: "/ledger" },
      { id: "engine", icon: "◉", label: "AI Engine", href: "/engine" },
      { id: "ai", icon: "⟠", label: "AI Explained", href: "/ai" },
    ],
  },
];

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/profile": "Profile",
  "/sos": "SOS Queue",
  "/match": "AI Matchmaker",
  "/connections": "Connections",
  "/hackathon": "Hackathon Teambuilder",
  "/dsa": "DSA Arena",
  "/pods": "Study Pods",
  "/ledger": "Karma Ledger",
  "/engine": "AI Engine",
  "/ai": "AI Explained",
  "/skills": "Skills",
};
