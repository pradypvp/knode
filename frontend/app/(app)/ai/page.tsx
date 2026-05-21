"use client";

import Link from "next/link";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(155,135,245,0.15)] bg-[rgba(0,0,0,0.25)] p-6">
      <div className="font-[family-name:var(--font-syne)] text-[14px] font-semibold text-[#f0eeff]">
        {title}
      </div>
      <div className="mt-2 text-[13px] leading-relaxed text-[rgba(240,238,255,0.6)]">
        {children}
      </div>
    </div>
  );
}

export default function AiExplainedPage() {
  return (
    <div className="mx-auto w-full max-w-[900px]">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-[21px] font-bold text-[#f0eeff]">
          AI Explained
        </h1>
        <p className="mt-1 text-[13px] text-[rgba(240,238,255,0.35)]">
          How Knode ranks helpers, bridges skill gaps, and routes SOS sessions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="1) Skill graph + closure inference">
          <p>
            Skills aren’t independent keywords. We expand skills using implication
            rules (example: <span className="font-mono">tensorflow</span> ⇒{" "}
            <span className="font-mono">python</span>) so search and matchmaking
            behave like humans expect.
          </p>
          <p className="mt-2">
            Implementation:
            <span className="ml-2 rounded bg-[rgba(155,135,245,0.1)] px-2 py-0.5 font-mono text-[12px] text-[#9b87f5]">
              backend/src/lib/skill-implications.ts
            </span>
            <span className="mx-2 text-[rgba(240,238,255,0.35)]">and</span>
            <span className="rounded bg-[rgba(0,229,160,0.1)] px-2 py-0.5 font-mono text-[12px] text-[#00e5a0]">
              ai-engine/algorithms/inference.py
            </span>
          </p>
        </Section>

        <Section title="2) A* bridging (shortest path to missing skills)">
          <p>
            When a candidate doesn’t directly cover a needed skill, we compute a
            “bridge cost”: how far the candidate is in the skill graph from that
            target skill. Lower cost means “closer” knowledge.
          </p>
          <p className="mt-2">
            This uses A* with a zero heuristic (so it behaves like shortest-path
            search) over the directed skill edges.
          </p>
          <p className="mt-2">
            Implementation:
            <span className="ml-2 rounded bg-[rgba(0,229,160,0.1)] px-2 py-0.5 font-mono text-[12px] text-[#00e5a0]">
              ai-engine/algorithms/astar_search.py
            </span>
            <span className="mx-2 text-[rgba(240,238,255,0.35)]">and</span>
            <span className="rounded bg-[rgba(0,229,160,0.1)] px-2 py-0.5 font-mono text-[12px] text-[#00e5a0]">
              ai-engine/algorithms/path_score.py
            </span>
          </p>
        </Section>

        <Section title="3) Match scoring (overlap + coverage − bridge + trust)">
          <p>
            Candidates are ranked using a weighted score that combines:
          </p>
          <ul className="mt-2 list-disc pl-5">
            <li>
              <span className="font-semibold text-[#f0eeff]">Overlap</span>: shared skills
            </li>
            <li>
              <span className="font-semibold text-[#f0eeff]">Coverage</span>: fraction of seeker needs covered
            </li>
            <li>
              <span className="font-semibold text-[#f0eeff]">Bridge cost</span>: A* distance penalty for missing skills
            </li>
            <li>
              <span className="font-semibold text-[#f0eeff]">Credibility & karma</span>: trust/engagement signals
            </li>
            <li>
              <span className="font-semibold text-[#f0eeff]">Proficiency bonus</span>: higher skill levels contribute more
            </li>
          </ul>
          <p className="mt-2">
            Implementation:
            <span className="ml-2 rounded bg-[rgba(0,229,160,0.1)] px-2 py-0.5 font-mono text-[12px] text-[#00e5a0]">
              ai-engine/services/matching_core.py
            </span>
          </p>
        </Section>

        <Section title="4) Turning scores into a real percentage">
          <p>
            Raw scores are unbounded and depend on the candidate pool. For the UI,
            we map them into a stable 0–100% using a distribution-based
            normalization (z-score → sigmoid), so the result never goes negative
            and doesn’t spike unrealistically with small candidate sets.
          </p>
          <p className="mt-2">
            Implementation:
            <span className="ml-2 rounded bg-[rgba(155,135,245,0.1)] px-2 py-0.5 font-mono text-[12px] text-[#9b87f5]">
              backend/src/services/matchmakingService.ts
            </span>
          </p>
        </Section>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Section title="SOS: real-time accept + chat">
          <p>
            SOS requests are posted by seekers and can be “picked” by helpers.
            Once picked, both users can chat in a live session and optionally jump
            to a call link.
          </p>
          <p className="mt-2">
            Try it from{" "}
            <Link href="/sos" className="text-[#9b87f5] underline">
              SOS Queue
            </Link>{" "}
            with the seeded demo users.
          </p>
        </Section>

        <Section title="Why this matters (benefits)">
          <ul className="mt-1 list-disc pl-5">
            <li>Find the right peer faster than keyword search.</li>
            <li>Bridging makes “near-matches” useful, not discarded.</li>
            <li>Credibility/karma nudges toward reliable helpers.</li>
            <li>SOS turns matching into a measurable, demoable workflow.</li>
          </ul>
        </Section>
      </div>

      <p className="mt-8 text-[13px] text-[rgba(240,238,255,0.35)]">
        Tip: For deeper details, open{" "}
        <Link href="/engine" className="text-[#9b87f5] underline">
          AI Engine
        </Link>{" "}
        and the code references above.
      </p>
    </div>
  );
}

