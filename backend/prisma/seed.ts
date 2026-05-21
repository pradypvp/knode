import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { expandSkillsForStorage } from "../src/lib/skill-implications.js";

const prisma = new PrismaClient();

/** Shared password for every demo row — change in production. */
const DEMO_PASSWORD = "demo1234";

const DEMO_USERS: {
  email: string;
  name: string;
  department: string;
  year: number;
  bio: string;
  careerGoal?: string;
  karmaBalance?: number;
  credibilityScore?: number;
  skills: { skill: string; proficiency: number }[];
}[] = [
  {
    email: "alex@demo.knode",
    name: "Alex Chen",
    department: "ECE",
    year: 2,
    bio: "ML + systems. Good for TensorFlow / CUDA demos.",
    careerGoal: "aiml",
    karmaBalance: 520,
    credibilityScore: 62,
    skills: [
      { skill: "python", proficiency: 5 },
      { skill: "tensorflow", proficiency: 4 },
      { skill: "dsa", proficiency: 4 },
      { skill: "cuda", proficiency: 3 },
    ],
  },
  {
    email: "priya@demo.knode",
    name: "Priya Nair",
    department: "CSE",
    year: 3,
    bio: "Graph algorithms & PyTorch.",
    careerGoal: "researcher",
    karmaBalance: 480,
    credibilityScore: 70,
    skills: [
      { skill: "pytorch", proficiency: 5 },
      { skill: "graphs", proficiency: 5 },
      { skill: "python", proficiency: 5 },
    ],
  },
  {
    email: "jordan@demo.knode",
    name: "Jordan Lee",
    department: "IT",
    year: 2,
    bio: "Frontend + Node.",
    careerGoal: "developer",
    karmaBalance: 410,
    credibilityScore: 55,
    skills: [
      { skill: "react", proficiency: 5 },
      { skill: "javascript", proficiency: 5 },
      { skill: "next.js", proficiency: 4 },
    ],
  },
  {
    email: "sam@demo.knode",
    name: "Sam Rivera",
    department: "AIDS",
    year: 1,
    bio: "Databases & SQL.",
    careerGoal: "developer",
    karmaBalance: 350,
    credibilityScore: 50,
    skills: [
      { skill: "postgresql", proficiency: 4 },
      { skill: "sql", proficiency: 4 },
    ],
  },
  {
    email: "pradyumna@demo.knode",
    name: "Pradyumna",
    department: "CSE",
    year: 2,
    bio: "Backend + DevOps. Docker/K8s, fast APIs, clean infra.",
    careerGoal: "developer",
    karmaBalance: 610,
    credibilityScore: 78,
    skills: [
      { skill: "node.js", proficiency: 5 },
      { skill: "express", proficiency: 5 },
      { skill: "docker", proficiency: 4 },
      { skill: "kubernetes", proficiency: 3 },
      { skill: "redis", proficiency: 3 },
    ],
  },
  {
    email: "yash@demo.knode",
    name: "Yash",
    department: "ECE",
    year: 1,
    bio: "Competitive programming + DSA. Fast problem solver.",
    careerGoal: "dsa",
    karmaBalance: 460,
    credibilityScore: 64,
    skills: [
      { skill: "dsa", proficiency: 5 },
      { skill: "graphs", proficiency: 4 },
      { skill: "c", proficiency: 4 },
      { skill: "python", proficiency: 3 },
    ],
  },
  {
    email: "srivaths@demo.knode",
    name: "Srivaths",
    department: "IT",
    year: 3,
    bio: "Full-stack: Next.js + GraphQL + Postgres.",
    careerGoal: "developer",
    karmaBalance: 540,
    credibilityScore: 72,
    skills: [
      { skill: "next.js", proficiency: 5 },
      { skill: "react", proficiency: 5 },
      { skill: "typescript", proficiency: 4 },
      { skill: "graphql", proficiency: 4 },
      { skill: "postgresql", proficiency: 3 },
    ],
  },
  {
    email: "ananya@demo.knode",
    name: "Ananya Singh",
    department: "AIDS",
    year: 2,
    bio: "Data + ML. Strong in sklearn/pandas and feature work.",
    careerGoal: "researcher",
    karmaBalance: 430,
    credibilityScore: 66,
    skills: [
      { skill: "python", proficiency: 5 },
      { skill: "scikit-learn", proficiency: 4 },
      { skill: "pandas", proficiency: 4 },
      { skill: "sql", proficiency: 3 },
    ],
  },
  {
    email: "rohan@demo.knode",
    name: "Rohan Mehta",
    department: "CSE",
    year: 4,
    bio: "Systems + networking. Linux, Docker, performance tuning.",
    careerGoal: "cybersecurity",
    karmaBalance: 700,
    credibilityScore: 82,
    skills: [
      { skill: "linux", proficiency: 5 },
      { skill: "docker", proficiency: 4 },
      { skill: "node.js", proficiency: 4 },
      { skill: "postgresql", proficiency: 3 },
    ],
  },
  {
    email: "meera@demo.knode",
    name: "Meera Iyer",
    department: "CSE",
    year: 2,
    bio: "Frontend design systems. React + Tailwind + UX polish.",
    careerGoal: "product",
    karmaBalance: 390,
    credibilityScore: 58,
    skills: [
      { skill: "react", proficiency: 5 },
      { skill: "tailwind", proficiency: 5 },
      { skill: "css", proficiency: 4 },
      { skill: "javascript", proficiency: 4 },
    ],
  },
  {
    email: "arjun@demo.knode",
    name: "Arjun Kumar",
    department: "ECE",
    year: 3,
    bio: "CV + DL. OpenCV + PyTorch experiments.",
    careerGoal: "aiml",
    karmaBalance: 520,
    credibilityScore: 69,
    skills: [
      { skill: "opencv", proficiency: 4 },
      { skill: "pytorch", proficiency: 4 },
      { skill: "python", proficiency: 5 },
    ],
  },
  {
    email: "zara@demo.knode",
    name: "Zara Khan",
    department: "IT",
    year: 1,
    bio: "Web fundamentals + backend basics. Great for beginner demos.",
    careerGoal: "developer",
    karmaBalance: 260,
    credibilityScore: 48,
    skills: [
      { skill: "html", proficiency: 4 },
      { skill: "css", proficiency: 4 },
      { skill: "javascript", proficiency: 3 },
      { skill: "node.js", proficiency: 2 },
    ],
  },
  {
    email: "dev@demo.knode",
    name: "Dev Patel",
    department: "CSE",
    year: 3,
    bio: "Backend APIs + DB modeling. Express + SQL + Redis.",
    careerGoal: "developer",
    karmaBalance: 500,
    credibilityScore: 67,
    skills: [
      { skill: "express", proficiency: 5 },
      { skill: "postgresql", proficiency: 4 },
      { skill: "redis", proficiency: 4 },
      { skill: "sql", proficiency: 4 },
    ],
  },
];

async function replaceUserSkills(
  userId: string,
  skills: { skill: string; proficiency: number }[]
) {
  const expanded = expandSkillsForStorage(skills);
  await prisma.userSkill.deleteMany({ where: { userId } });
  for (const s of expanded) {
    await prisma.userSkill.create({
      data: {
        userId,
        skill: s.skill,
        proficiency: s.proficiency,
      },
    });
  }
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const d of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { email: d.email },
      update: {
        name: d.name,
        department: d.department,
        year: d.year,
        bio: d.bio,
        careerGoal: d.careerGoal ?? null,
        passwordHash,
        karmaBalance: d.karmaBalance ?? 400,
        credibilityScore: d.credibilityScore ?? 55,
      },
      create: {
        email: d.email,
        name: d.name,
        passwordHash,
        department: d.department,
        year: d.year,
        bio: d.bio,
        careerGoal: d.careerGoal ?? null,
        karmaBalance: d.karmaBalance ?? 400,
        credibilityScore: d.credibilityScore ?? 55,
      },
    });
    await replaceUserSkills(user.id, d.skills);
  }

  const alex = await prisma.user.findUnique({
    where: { email: "alex@demo.knode" },
  });
  const priya = await prisma.user.findUnique({
    where: { email: "priya@demo.knode" },
  });

  if (alex) {
    await prisma.sosChatMessage.deleteMany({
      where: { sos: { userId: alex.id } },
    });
    await prisma.sOSRequest.deleteMany({ where: { userId: alex.id } });
    await prisma.sOSRequest.create({
      data: {
        userId: alex.id,
        title: "Demo: CUDA segfault in custom conv kernel",
        description:
          "Seed SOS — log in as another demo user, pick this from the queue, then use Help session for chat + Jitsi.",
        topicTag: "ml",
        targetSkill: "python",
        bountyKarma: 0,
        status: "OPEN",
      },
    });
  }

  if (priya) {
    await prisma.sosChatMessage.deleteMany({
      where: { sos: { userId: priya.id } },
    });
    await prisma.sOSRequest.deleteMany({ where: { userId: priya.id } });
    await prisma.sOSRequest.create({
      data: {
        userId: priya.id,
        title: "Demo: Need pair for Dijkstra proof on weighted DAG",
        description: "Good for matchmaking — seekers can search graphs, dsa, python.",
        topicTag: "dsa",
        targetSkill: "graphs",
        bountyKarma: 0,
        status: "OPEN",
      },
    });
  }

  const srivaths = await prisma.user.findUnique({
    where: { email: "srivaths@demo.knode" },
  });
  if (srivaths) {
    await prisma.sosChatMessage.deleteMany({
      where: { sos: { userId: srivaths.id } },
    });
    await prisma.sOSRequest.deleteMany({ where: { userId: srivaths.id } });
    await prisma.sOSRequest.create({
      data: {
        userId: srivaths.id,
        title: "Demo: GraphQL resolver returning N+1 queries",
        description:
          "Seed SOS — accept this to demo SOS pick + chat. Good for system design + DB optimization discussion.",
        topicTag: "backend",
        targetSkill: "graphql",
        bountyKarma: 0,
        status: "OPEN",
      },
    });
  }

  console.log("Demo seed OK.");
  console.log("");
  console.log("  Password for all: %s", DEMO_PASSWORD);
  console.log("");
  for (const d of DEMO_USERS) {
    console.log("  • %s — %s", d.email, d.name);
  }
  console.log("");
  console.log("  Open SOS rows recreated for alex@ and priya@.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
