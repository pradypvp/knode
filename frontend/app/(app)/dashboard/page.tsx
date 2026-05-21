"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  apiGet,
  apiPost,
  ApiError,
} from "@/lib/api";
import { formatKarmaDisplay } from "@/lib/format-karma";
import { cn } from "@/lib/utils";

type SosItem = {
  id: string;
  title: string;
  description: string | null;
  bountyKarma: number;
  createdAt: string;
  author: { id: string; name: string | null };
};

type MatchRow = {
  userId: string;
  name: string | null;
  credibilityScore: number;
  karmaBalance: number;
  overlap: number;
  score: number;
  skills: { skill: string; proficiency: number }[];
};

const SKILL_COLORS = [
  "#9b87f5",
  "#06b6d4",
  "#00e5a0",
  "#f5a623",
  "#ff4d6a",
  "#9b87f5",
];

const ACTIVITY = [
  {
    text: "Session ratings and karma updates appear here as you teach.",
    time: "Soon",
    color: "#9b87f5",
  },
  {
    text: "Post an SOS or accept one from the queue to move the economy.",
    time: "Tip",
    color: "#f5a623",
  },
  {
    text: "Run A* matchmaking from Matchmaker with skill tags you care about.",
    time: "Tip",
    color: "#06b6d4",
  },
];

const HACKS = [
  {
    name: "Hack the North 2025",
    theme: "AI × Healthcare",
    stack: ["Python", "React", "TF"],
    colors: ["#9b87f5", "#06b6d4", "#f5a623"],
    slots: 1,
  },
  {
    name: "SRM DevSprint",
    theme: "EdTech Platform",
    stack: ["Next.js", "Node", "Mongo"],
    colors: ["#00e5a0", "#9b87f5"],
    slots: 2,
  },
];

function KnodeCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[rgba(155,135,245,0.15)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] to-[rgba(155,135,245,0.02)] transition-colors hover:border-[rgba(155,135,245,0.25)]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-[rgba(155,135,245,0.15)] px-5 py-4">
        <h2 className="font-[family-name:var(--font-syne)] text-sm font-semibold text-[#f0eeff]">
          {title}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [peerId, setPeerId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("10");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [sosItems, setSosItems] = useState<SosItem[]>([]);
  const [sosErr, setSosErr] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [matchErr, setMatchErr] = useState<string | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);

  const connectTo = useCallback(
    async (targetUserId: string) => {
      setMatchErr(null);
      try {
        await apiPost("/connections/request", { toUserId: targetUserId });
        router.push("/connections");
      } catch (e) {
        setMatchErr(e instanceof ApiError ? e.message : "Connect failed");
      }
    },
    [router]
  );

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const data = await apiGet<{ items: SosItem[] }>("/sos");
        setSosItems(data.items.slice(0, 4));
      } catch (e) {
        setSosErr(e instanceof ApiError ? e.message : "Could not load SOS");
      }
    })();
  }, [user]);

  const loadMatches = useCallback(async () => {
    if (!user) return;
    setMatchErr(null);
    setMatchLoading(true);
    try {
      const skills =
        user.skills && user.skills.length > 0
          ? user.skills
              .slice(0, 12)
              .map((s) => s.skill.toLowerCase())
          : ["python", "dsa", "graphs"];
      const data = await apiPost<{ matches: MatchRow[] }>(
        "/matchmaking/find",
        { skills, goal: user.careerGoal ?? undefined },
      );
      setMatches(data.matches.slice(0, 4));
    } catch (e) {
      setMatchErr(e instanceof ApiError ? e.message : "Match preview failed");
    } finally {
      setMatchLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  const onSession = async () => {
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      await apiPost("/credibility/session", { peerUserId: peerId.trim() });
      setMsg("Credibility updated for both users.");
      await refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  };

  const onTransfer = async () => {
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      const n = parseInt(amount, 10);
      await apiPost("/karma/transfer", {
        toUserId: toUserId.trim(),
        amount: n,
        clientKey:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}`,
      });
      setMsg("Transfer completed.");
      await refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Transfer failed");
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return null;
  }

  const karmaStr = formatKarmaDisplay(user.karmaBalance);
  const cred = (user.credibilityScore / 20).toFixed(1);
  const skills = user.skills ?? [];

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-[21px] font-bold tracking-tight text-[#f0eeff]">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="mt-1 text-[13px] font-light text-[rgba(240,238,255,0.35)]">
            Your skill graph powers A* matches and SOS routing — keep skills
            updated.
          </p>
        </div>
        <Link href="/sos">
          <Button
            type="button"
            className="h-10 rounded-full border border-[rgba(155,135,245,0.35)] bg-gradient-to-br from-[rgba(155,135,245,0.15)] to-[rgba(155,135,245,0.05)] px-5 text-[12px] font-medium text-white shadow-[0_0_30px_rgba(155,135,245,0.15)] hover:border-[rgba(155,135,245,0.6)]"
          >
            + Post SOS
          </Button>
        </Link>
      </div>

      <div className="mb-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Karma Balance",
            val: karmaStr,
            sub: "Ledger-backed",
            accent: "purple" as const,
          },
          {
            label: "Credibility Score",
            val: cred,
            sub: "Session-weighted",
            accent: "amber" as const,
          },
          {
            label: "Skills listed",
            val: String(skills.length),
            sub: "Edit in Skills",
            accent: "cyan" as const,
          },
          {
            label: "Campus rank",
            val: "#—",
            sub: "Placeholder",
            accent: "green" as const,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-[14px] border border-[rgba(155,135,245,0.15)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] to-[rgba(155,135,245,0.03)] p-[18px] transition hover:border-[rgba(155,135,245,0.3)]"
          >
            <div
              className={cn(
                "absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent",
                s.accent === "purple" &&
                  "via-[#9b87f5]",
                s.accent === "amber" &&
                  "via-[#f5a623]",
                s.accent === "cyan" &&
                  "via-[#06b6d4]",
                s.accent === "green" &&
                  "via-[#00e5a0]",
              )}
            />
            <div className="mb-2.5 font-mono text-[10px] font-medium uppercase tracking-[1px] text-[rgba(240,238,255,0.35)]">
              {s.label}
            </div>
            <div
              className={cn(
                "font-[family-name:var(--font-syne)] text-[26px] font-bold leading-none tracking-tight",
                s.accent === "purple" && "text-[#9b87f5]",
                s.accent === "amber" && "text-[#f5a623]",
                s.accent === "cyan" && "text-[#06b6d4]",
                s.accent === "green" && "text-[#00e5a0]",
              )}
            >
              {s.val}
            </div>
            <div className="mt-1 font-mono text-[11px] text-[#00e5a0]">
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-[18px] lg:grid-cols-2">
        <KnodeCard
          title="Live SOS Queue"
          action={
            <span className="rounded-full border border-[rgba(155,135,245,0.2)] bg-[rgba(155,135,245,0.1)] px-2 py-0.5 font-mono text-[10px] text-[#9b87f5]">
              ● LIVE
            </span>
          }
        >
          {sosErr ? (
            <p className="text-sm text-[#ff4d6a]">{sosErr}</p>
          ) : sosItems.length === 0 ? (
            <p className="text-sm text-[rgba(240,238,255,0.45)]">
              No open SOS tickets. Be the first to post one.
            </p>
          ) : (
            <div className="flex flex-col">
              {sosItems.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 border-b border-[rgba(155,135,245,0.15)] py-3 last:border-0"
                >
                  <div className="min-w-[52px] shrink-0 rounded-[9px] border border-[rgba(245,166,35,0.2)] bg-[rgba(245,166,35,0.1)] px-2 py-1.5 text-center">
                    <div className="font-mono text-[13px] font-bold text-[#f5a623]">
                      {formatKarmaDisplay(s.bountyKarma)}
                    </div>
                    <div className="text-[9px] uppercase tracking-wide text-[rgba(240,238,255,0.35)]">
                      karma
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] text-[#f0eeff]">
                      {s.title}
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-[rgba(240,238,255,0.35)]">
                      {s.author.name ?? "Peer"} ·{" "}
                      {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Link href="/sos">
                    <button
                      type="button"
                      className="shrink-0 rounded-[7px] border border-[rgba(0,229,160,0.3)] bg-gradient-to-br from-[rgba(0,229,160,0.15)] to-[rgba(0,229,160,0.05)] px-3 py-1.5 font-mono text-[11px] font-semibold text-[#00e5a0] transition hover:bg-[rgba(0,229,160,0.2)]"
                    >
                      OPEN
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </KnodeCard>

        <KnodeCard
          title="A* Optimal Matches"
          action={
            <button
              type="button"
              onClick={() => void loadMatches()}
              className="cursor-pointer rounded-md border border-[rgba(155,135,245,0.2)] bg-[rgba(155,135,245,0.08)] px-2.5 py-1 font-mono text-[11px] text-[#9b87f5] transition hover:bg-[rgba(155,135,245,0.15)]"
            >
              {matchLoading ? "…" : "Refresh"}
            </button>
          }
        >
          {matchErr ? (
            <p className="text-sm text-[#ff4d6a]">{matchErr}</p>
          ) : matches.length === 0 ? (
            <p className="text-sm text-[rgba(240,238,255,0.45)]">
              {matchLoading
                ? "Running ranker…"
                : "Add skills on your profile, then refresh."}
            </p>
          ) : (
            <div className="flex flex-col">
              {matches.map((m, i) => {
                const color = SKILL_COLORS[i % SKILL_COLORS.length];
                const initials =
                  (m.name ?? "?")
                    .split(/\s+/)
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "?";
                return (
                  <div
                    key={m.userId}
                    className="flex items-center gap-3 border-b border-[rgba(155,135,245,0.15)] py-3 last:border-0"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold"
                      style={{
                        background: `${color}22`,
                        borderColor: `${color}44`,
                        color,
                      }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-[#f0eeff]">
                        {m.name ?? "Anonymous"}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {m.skills.slice(0, 3).map((sk) => (
                          <span
                            key={sk.skill}
                            className="rounded border border-[rgba(155,135,245,0.15)] bg-[rgba(155,135,245,0.06)] px-1.5 py-0.5 font-mono text-[10px] text-[#9b87f5]"
                          >
                            {sk.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="font-[family-name:var(--font-syne)] text-[17px] font-bold"
                        style={{ color }}
                      >
                        {m.score.toFixed(0)}%
                      </div>
                      <div className="font-mono text-[10px] text-[rgba(240,238,255,0.35)]">
                        A* score
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void connectTo(m.userId)}
                      className="rounded-[7px] border border-[rgba(255,255,255,0.08)] px-3 py-1 font-mono text-[11px] text-[rgba(240,238,255,0.6)] transition hover:border-[rgba(155,135,245,0.4)] hover:bg-[rgba(155,135,245,0.06)] hover:text-[#9b87f5]"
                    >
                      Connect
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </KnodeCard>
      </div>

      <div className="mb-5 grid gap-[18px] lg:grid-cols-3">
        <KnodeCard title="Skill Graph">
          {skills.length === 0 ? (
            <p className="text-sm text-[rgba(240,238,255,0.45)]">
              <Link href="/skills" className="text-[#9b87f5] underline">
                Add skills
              </Link>{" "}
              to see your graph here.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {skills.slice(0, 6).map((sk, i) => (
                <div key={sk.skill} className="flex items-center gap-2.5">
                  <span className="w-[130px] shrink-0 font-mono text-[12px] text-[rgba(240,238,255,0.6)]">
                    {sk.skill}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-[rgba(255,255,255,0.06)]">
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: `${Math.max(
                          6,
                          Math.min(100, (sk.proficiency / 5) * 100)
                        )}%`,
                        background: SKILL_COLORS[i % SKILL_COLORS.length],
                      }}
                    />
                  </div>
                  <span className="w-7 shrink-0 text-right font-mono text-[10px] text-[rgba(240,238,255,0.35)]">
                    {sk.proficiency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </KnodeCard>

        <KnodeCard title="Activity Feed">
          <div className="flex flex-col">
            {ACTIVITY.map((a, i) => (
              <div
                key={i}
                className="flex gap-3 border-b border-[rgba(155,135,245,0.15)] py-2.5 last:border-0"
              >
                <div
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: a.color }}
                />
                <div>
                  <p className="text-[12px] leading-relaxed text-[rgba(240,238,255,0.6)]">
                    {a.text}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-[rgba(240,238,255,0.35)]">
                    {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </KnodeCard>

        <KnodeCard
          title="Hackathon Pods"
          action={
            <Link
              href="/hackathon"
              className="cursor-pointer rounded-md border border-[rgba(155,135,245,0.2)] bg-[rgba(155,135,245,0.08)] px-2.5 py-1 font-mono text-[11px] text-[#9b87f5]"
            >
              Browse
            </Link>
          }
        >
          <div className="flex flex-col gap-3">
            {HACKS.map((h) => (
              <div
                key={h.name}
                className="relative cursor-pointer overflow-hidden rounded-xl border border-[rgba(155,135,245,0.15)] bg-gradient-to-br from-[rgba(155,135,245,0.06)] to-[rgba(155,135,245,0.02)] p-4 transition hover:border-[rgba(155,135,245,0.35)]"
              >
                <div className="font-[family-name:var(--font-syne)] text-sm font-semibold text-[#f0eeff]">
                  {h.name}
                </div>
                <div className="mt-1 text-[11px] text-[rgba(240,238,255,0.35)]">
                  {h.theme}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {h.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 font-mono text-[10px] text-[rgba(240,238,255,0.6)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex">
                    {h.colors.map((c, j) => (
                      <div
                        key={j}
                        className="-ml-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-[#0d0a1e] text-[9px] font-bold text-white first:ml-0"
                        style={{ background: c }}
                      >
                        {"RAP"[j] ?? "?"}
                      </div>
                    ))}
                  </div>
                  <span className="font-mono text-[11px] text-[#00e5a0]">
                    +{h.slots} open
                  </span>
                </div>
              </div>
            ))}
          </div>
        </KnodeCard>
      </div>

      <div className="rounded-2xl border border-[rgba(155,135,245,0.15)] bg-[rgba(0,0,0,0.25)] p-6">
        <h3 className="mb-4 font-[family-name:var(--font-syne)] text-sm font-semibold text-[rgba(240,238,255,0.85)]">
          Economy & sessions
        </h3>
        {msg ? (
          <p className="mb-3 text-sm text-[#00e5a0]">{msg}</p>
        ) : null}
        {err ? <p className="mb-3 text-sm text-[#ff4d6a]">{err}</p> : null}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label htmlFor="to" className="font-mono text-[11px] text-[rgba(240,238,255,0.5)]">
              Send karma (recipient user id)
            </Label>
            <Input
              id="to"
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              placeholder="uuid"
              className="border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
            />
            <div className="flex gap-3">
              <Input
                id="amt"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-28 border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)]"
              />
              <Button
                type="button"
                disabled={busy}
                onClick={() => void onTransfer()}
                className="border border-[rgba(155,135,245,0.3)] bg-[rgba(155,135,245,0.12)] text-[#9b87f5] hover:bg-[rgba(155,135,245,0.2)]"
              >
                Transfer
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="peer" className="font-mono text-[11px] text-[rgba(240,238,255,0.5)]">
              Record study session (peer user id)
            </Label>
            <Input
              id="peer"
              value={peerId}
              onChange={(e) => setPeerId(e.target.value)}
              placeholder="uuid"
              className="border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
            />
            <Button
              type="button"
              disabled={busy}
              onClick={() => void onSession()}
              className="w-fit border border-[rgba(0,229,160,0.3)] bg-[rgba(0,229,160,0.1)] text-[#00e5a0] hover:bg-[rgba(0,229,160,0.18)]"
            >
              Record session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
