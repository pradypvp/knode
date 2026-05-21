"use client";

import Link from "next/link";

export default function EnginePage() {
  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-[21px] font-bold text-[#f0eeff]">
          AI Engine
        </h1>
        <p className="mt-1 text-[13px] text-[rgba(240,238,255,0.35)]">
          Python service: graph inference, A* bridging, batch rank, SOS bounty
          suggestion
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[rgba(155,135,245,0.15)] bg-[rgba(0,0,0,0.25)] p-6">
          <div className="mb-2 font-mono text-[11px] text-[#9b87f5]">MATCHMAKING</div>
          <p className="text-sm text-[rgba(240,238,255,0.65)]">
            <code className="rounded bg-[rgba(155,135,245,0.1)] px-1.5 py-0.5 font-mono text-xs text-[#06b6d4]">
              POST /match/rank
            </code>{" "}
            — used by{" "}
            <Link href="/match" className="text-[#9b87f5] underline">
              Matchmaker
            </Link>{" "}
            via the Node API.
          </p>
        </div>
        <div className="rounded-2xl border border-[rgba(155,135,245,0.15)] bg-[rgba(0,0,0,0.25)] p-6">
          <div className="mb-2 font-mono text-[11px] text-[#f5a623]">SOS</div>
          <p className="text-sm text-[rgba(240,238,255,0.65)]">
            Bounty suggestion:{" "}
            <code className="rounded bg-[rgba(245,166,35,0.1)] px-1.5 py-0.5 font-mono text-xs text-[#f5a623]">
              POST /api/sos/suggest-bounty
            </code>{" "}
            (proxied from backend when{" "}
            <code className="font-mono text-xs">AI_ENGINE_URL</code> is set).
          </p>
        </div>
      </div>

      <p className="mt-8 text-[13px] text-[rgba(240,238,255,0.35)]">
        Run the engine from <code className="font-mono text-xs">ai-engine/</code>{" "}
        (default port <span className="text-[#00e5a0]">8010</span> in{" "}
        <code className="font-mono text-xs">run.sh</code>).
      </p>
    </div>
  );
}
