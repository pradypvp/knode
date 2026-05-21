import Link from "next/link";
import { KnodeHeader } from "@/components/knode-header";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      <KnodeHeader />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-[60%] w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(155,135,245,0.18),transparent_65%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-[60%] w-1/2 bg-[radial-gradient(circle_at_30%_30%,rgba(155,135,245,0.12),transparent_65%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(155,135,245,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(155,135,245,0.04)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)] [background-size:60px_60px]"
        />

        <main className="relative z-10 mx-auto flex w-full max-w-[900px] flex-1 flex-col items-center px-6 pb-24 pt-12 text-center sm:pt-20">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[rgba(155,135,245,0.3)] bg-[rgba(155,135,245,0.05)] px-4 py-1.5 font-mono text-[11px] tracking-wide text-[#9b87f5]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9b87f5]" />
            ACADEMIC PEER EXCHANGE · NEXT GENERATION
          </div>

          <h1 className="font-[family-name:var(--font-syne)] text-balance text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.1] tracking-[-0.06em] text-[#f0eeff]">
            Find Your Perfect
            <br />
            <span className="text-[#9b87f5]">Academic Match</span>
            <br />
            with AI Precision
          </h1>

          <p className="mt-5 max-w-[560px] text-pretty text-[1.05rem] font-light leading-relaxed text-[rgba(240,238,255,0.6)]">
            Knode uses A* search, first-order logic, and minimax-style SOS economics
            to match engineering students for tutoring, debugging, and hackathon
            teams — backed by a real karma ledger.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 rounded-full border border-[rgba(155,135,245,0.35)] bg-gradient-to-br from-[rgba(155,135,245,0.15)] to-[rgba(155,135,245,0.05)] px-8 text-[14px] font-medium text-white shadow-[0_0_30px_rgba(155,135,245,0.15)] hover:border-[rgba(155,135,245,0.6)] hover:shadow-[0_0_40px_rgba(155,135,245,0.35)]"
              >
                Launch Dashboard →
              </Button>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 text-[14px] font-light text-[rgba(255,255,255,0.6)] transition hover:text-white"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-14 w-full max-w-[860px] overflow-hidden rounded-2xl border border-[rgba(155,135,245,0.2)] shadow-[0_0_80px_rgba(155,135,245,0.2),0_40px_80px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 border-b border-[rgba(155,135,245,0.1)] bg-[rgba(21,13,39,0.9)] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-[11px] text-[rgba(240,238,255,0.35)]">
                knode.app/dashboard
              </span>
            </div>
            <div className="grid gap-3 bg-[rgba(13,10,30,0.95)] p-6 sm:grid-cols-2">
              <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:grid-cols-4">
                {[
                  { l: "Karma", v: "340K", c: "#9b87f5" },
                  { l: "Credibility", v: "4.8★", c: "#f5a623" },
                  { l: "Sessions", v: "23", c: "#06b6d4" },
                  { l: "Rank", v: "#14", c: "#00e5a0" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-lg border border-[rgba(155,135,245,0.12)] bg-[rgba(155,135,245,0.05)] px-3 py-3"
                  >
                    <div className="font-mono text-[9px] uppercase tracking-wide text-[rgba(240,238,255,0.4)]">
                      {s.l}
                    </div>
                    <div
                      className="font-[family-name:var(--font-syne)] text-xl font-bold"
                      style={{ color: s.c }}
                    >
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-[rgba(155,135,245,0.1)] bg-[rgba(155,135,245,0.04)] p-3 text-left">
                <div className="mb-2 font-mono text-[10px] text-[rgba(240,238,255,0.35)]">
                  LIVE SOS QUEUE
                </div>
                <div className="mb-2 flex gap-2 rounded-md bg-[rgba(255,255,255,0.03)] px-2 py-1.5 text-[11px]">
                  <span className="font-mono font-bold text-[#f5a623]">85K</span>
                  <span className="truncate text-[rgba(240,238,255,0.6)]">
                    Dijkstra on weighted DAG
                  </span>
                </div>
                <div className="flex gap-2 rounded-md bg-[rgba(255,255,255,0.03)] px-2 py-1.5 text-[11px]">
                  <span className="font-mono font-bold text-[#f5a623]">60K</span>
                  <span className="truncate text-[rgba(240,238,255,0.6)]">
                    React useEffect + WebSockets
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-[rgba(155,135,245,0.1)] bg-[rgba(155,135,245,0.04)] p-3 text-left">
                <div className="mb-2 font-mono text-[10px] text-[rgba(240,238,255,0.35)]">
                  A* OPTIMAL MATCHES
                </div>
                <div className="mb-2 flex items-center gap-2 text-[11px]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#9b87f5] text-[9px] font-bold text-white">
                    AM
                  </span>
                  <span className="flex-1 text-[rgba(240,238,255,0.65)]">
                    Arjun Mehta
                  </span>
                  <span className="font-mono font-bold text-[#00e5a0]">97%</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#06b6d4] text-[9px] font-bold text-white">
                    PN
                  </span>
                  <span className="flex-1 text-[rgba(240,238,255,0.65)]">
                    Priya Nair
                  </span>
                  <span className="font-mono font-bold text-[#06b6d4]">91%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {[
              { val: "2,400+", label: "Students" },
              { val: "18ms", label: "Match latency" },
              { val: "Live", label: "SOS + ledger" },
              { val: "₹0", label: "Cost to join" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-[family-name:var(--font-syne)] text-2xl font-bold text-[#9b87f5]">
                  {s.val}
                </div>
                <div className="mt-1 font-mono text-[11px] text-[rgba(240,238,255,0.35)]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
