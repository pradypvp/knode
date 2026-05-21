/** Canonical slugs — must align with backend `SKILL_IMPLIES` keys where applicable. */
export type CatalogSkill = {
  id: string;
  label: string;
  category: string;
};

export const SKILL_CATALOG: CatalogSkill[] = [
  // Languages
  { id: "python", label: "Python", category: "Languages" },
  { id: "javascript", label: "JavaScript", category: "Languages" },
  { id: "typescript", label: "TypeScript", category: "Languages" },
  { id: "c", label: "C", category: "Languages" },
  { id: "cpp", label: "C++", category: "Languages" },
  { id: "java", label: "Java", category: "Languages" },
  { id: "go", label: "Go", category: "Languages" },
  { id: "sql", label: "SQL", category: "Languages" },
  { id: "html", label: "HTML", category: "Languages" },
  { id: "css", label: "CSS", category: "Languages" },
  { id: "solidity", label: "Solidity", category: "Languages" },
  { id: "embedded-c", label: "Embedded C", category: "Languages" },
  { id: "verilog", label: "Verilog", category: "Languages" },
  { id: "vhdl", label: "VHDL", category: "Languages" },
  // ML / data
  { id: "tensorflow", label: "TensorFlow", category: "ML & data" },
  { id: "pytorch", label: "PyTorch", category: "ML & data" },
  { id: "keras", label: "Keras", category: "ML & data" },
  { id: "pandas", label: "Pandas", category: "ML & data" },
  { id: "numpy", label: "NumPy", category: "ML & data" },
  { id: "scikit-learn", label: "scikit-learn", category: "ML & data" },
  { id: "opencv", label: "OpenCV", category: "ML & data" },
  // Web / app
  { id: "react", label: "React", category: "Web / app" },
  { id: "next.js", label: "Next.js", category: "Web / app" },
  { id: "vue", label: "Vue", category: "Web / app" },
  { id: "angular", label: "Angular", category: "Web / app" },
  { id: "svelte", label: "Svelte", category: "Web / app" },
  { id: "nodejs", label: "Node.js", category: "Web / app" },
  { id: "express", label: "Express", category: "Web / app" },
  { id: "graphql", label: "GraphQL", category: "Web / app" },
  { id: "tailwind", label: "Tailwind CSS", category: "Web / app" },
  { id: "web3", label: "Web3", category: "Web / app" },
  { id: "wasm", label: "WebAssembly", category: "Web / app" },
  // Backend
  { id: "django", label: "Django", category: "Backend" },
  { id: "flask", label: "Flask", category: "Backend" },
  { id: "fastapi", label: "FastAPI", category: "Backend" },
  { id: "postgresql", label: "PostgreSQL", category: "Backend" },
  { id: "mysql", label: "MySQL", category: "Backend" },
  { id: "mongodb", label: "MongoDB", category: "Backend" },
  { id: "redis", label: "Redis", category: "Backend" },
  // Infra
  { id: "docker", label: "Docker", category: "Infra" },
  { id: "kubernetes", label: "Kubernetes", category: "Infra" },
  { id: "linux", label: "Linux", category: "Infra" },
  { id: "cuda", label: "CUDA", category: "Infra" },
  { id: "ethereum", label: "Ethereum", category: "Infra" },
  // Electronics / ECE
  { id: "digital-electronics", label: "Digital Electronics", category: "Electronics / ECE" },
  { id: "analog-electronics", label: "Analog Electronics", category: "Electronics / ECE" },
  { id: "signals-and-systems", label: "Signals & Systems", category: "Electronics / ECE" },
  { id: "signal-processing", label: "Signal Processing", category: "Electronics / ECE" },
  { id: "communication-systems", label: "Communication Systems", category: "Electronics / ECE" },
  { id: "control-systems", label: "Control Systems", category: "Electronics / ECE" },
  { id: "microcontrollers", label: "Microcontrollers", category: "Electronics / ECE" },
  { id: "embedded-systems", label: "Embedded Systems", category: "Electronics / ECE" },
  { id: "fpga", label: "FPGA", category: "Electronics / ECE" },
  { id: "vlsi", label: "VLSI", category: "Electronics / ECE" },
  { id: "pcb-design", label: "PCB Design", category: "Electronics / ECE" },
  { id: "iot", label: "IoT", category: "Electronics / ECE" },
];

export function groupSkillsByCategory(): Map<string, CatalogSkill[]> {
  const m = new Map<string, CatalogSkill[]>();
  for (const s of SKILL_CATALOG) {
    const arr = m.get(s.category) ?? [];
    arr.push(s);
    m.set(s.category, arr);
  }
  return m;
}
