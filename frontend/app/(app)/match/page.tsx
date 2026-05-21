"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost, ApiError } from "@/lib/api";
import { GOAL_OPTIONS } from "@/lib/goal-tracks";
import { SKILL_CATALOG } from "@/lib/skill-catalog";
import { cn } from "@/lib/utils";

type MatchRow = {
  userId: string;
  name: string | null;
  credibilityScore: number;
  karmaBalance: number;
  overlap: number;
  score: number;
  rawScore?: number;
  skills: { skill: string; proficiency: number }[];
  coverage?: number;
  bridging?: number;
  rawOverlap?: number;
};

const QUICK_PICKS = SKILL_CATALOG.slice(0, 36);

export default function MatchPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [chips, setChips] = useState<Set<string>>(new Set());
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [goalUsed, setGoalUsed] = useState<string | null>(null);
  const [targetSkills, setTargetSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const userGoal = user?.careerGoal ?? null;

  useEffect(() => {
    if (!user?.skills?.length) return;
    setQ(
      user.skills
        .map((s) => s.skill)
        .filter((s) => !QUICK_PICKS.some((c) => c.id === s))
        .slice(0, 8)
        .join(", "),
    );
    const next = new Set<string>();
    for (const s of user.skills) {
      if (QUICK_PICKS.some((c) => c.id === s.skill)) {
        next.add(s.skill);
      }
    }
    setChips(next);
  }, [user]);

  const toggleChip = (id: string) => {
    setChips((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const run = useCallback(async () => {
    setError(null);
    setPending(true);
    try {
      const fromText = q
        .split(/[,]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const fromChips = [...chips];
      const skills = [...new Set([...fromChips, ...fromText])];
      if (skills.length === 0) {
        setError("Add at least one skill (chip or text).");
        setPending(false);
        return;
      }
      const data = await apiPost<{
        matches: MatchRow[];
        goalUsed?: string | null;
        targetSkills?: string[];
      }>("/matchmaking/find", {
        skills,
        goal: userGoal ?? undefined,
      });
      setMatches(data.matches);
      setGoalUsed(data.goalUsed ?? null);
      setTargetSkills(data.targetSkills ?? []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Match failed");
    } finally {
      setPending(false);
    }
  }, [q, chips, userGoal]);

  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-[21px] font-bold text-[#f0eeff]">
          AI Matchmaker
        </h1>
        <p className="mt-1 text-[13px] text-[rgba(240,238,255,0.45)]">
          The backend expands implied skills (e.g. TensorFlow → Python) and, when{" "}
          <code className="font-mono text-xs text-[#06b6d4]">AI_ENGINE_URL</code>{" "}
          points at the Python service, runs the graph ranker. Otherwise you still
          get overlap scoring.
        </p>
        <p className="mt-1 text-[12px] text-[rgba(240,238,255,0.45)]">
          Goal:{" "}
          <span className="text-[#9b87f5]">
            {GOAL_OPTIONS.find((g) => g.id === (goalUsed ?? userGoal))?.label ??
              "Not set (general matching)"}
          </span>{" "}
          {targetSkills.length > 0
            ? ` · scoped to ${targetSkills.length} goal-relevant skills`
            : ""}
        </p>
      </div>
      <Card className="border-[rgba(155,135,245,0.15)] bg-[rgba(255,255,255,0.03)]">
        <CardHeader>
          <CardTitle className="text-[#f0eeff]">Skills you need help with</CardTitle>
          <CardDescription className="text-[rgba(240,238,255,0.45)]">
            Tap quick picks, then add free-form topics (comma-separated). Search
            uses the same implication rules as your profile skills.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label className="text-[rgba(240,238,255,0.55)]">Quick picks</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_PICKS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleChip(s.id)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-mono text-[11px] transition",
                    chips.has(s.id)
                      ? "border-[rgba(155,135,245,0.5)] bg-[rgba(155,135,245,0.2)] text-[#e8e0ff]"
                      : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-[rgba(240,238,255,0.55)] hover:border-[rgba(155,135,245,0.3)]",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="skills" className="text-[rgba(240,238,255,0.55)]">
              Extra topics (comma-separated)
            </Label>
            <Input
              id="skills"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="systems, calculus, competitive-dsa"
              className="border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
            />
          </div>
          <Button
            type="button"
            disabled={pending}
            onClick={() => void run()}
            className="w-fit border border-[rgba(155,135,245,0.3)] bg-[rgba(155,135,245,0.12)] text-[#9b87f5] hover:bg-[rgba(155,135,245,0.2)]"
          >
            {pending ? "Searching…" : "Find matches"}
          </Button>
        </CardContent>
      </Card>
      {error ? <p className="text-sm text-[#ff4d6a]">{error}</p> : null}
      <div className="flex flex-col gap-3">
        {matches.map((m) => (
          <Card
            key={m.userId}
            size="sm"
            className="border-[rgba(155,135,245,0.12)] bg-[rgba(0,0,0,0.2)]"
          >
            <CardHeader>
              <CardTitle className="text-base text-[#f0eeff]">
                {m.name ?? "Anonymous"} · score {m.score.toFixed(0)}%
              </CardTitle>
              <CardDescription className="text-[rgba(240,238,255,0.45)]">
                Overlap {m.overlap}
                {typeof m.coverage === "number"
                  ? ` · coverage ${(m.coverage * 100).toFixed(0)}%`
                  : ""}
                {typeof m.bridging === "number"
                  ? ` · bridge cost ${m.bridging.toFixed(1)}`
                  : ""}{" "}
                · credibility {m.credibilityScore} · karma {m.karmaBalance}
                {typeof m.rawScore === "number"
                  ? ` · raw ${m.rawScore.toFixed(1)}`
                  : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-[rgba(240,238,255,0.45)]">
              {m.skills.map((s) => s.skill).join(", ")}
            </CardContent>
          </Card>
        ))}
        {!pending && matches.length === 0 ? (
          <p className="text-sm text-[rgba(240,238,255,0.45)]">
            No matches yet — widen skills, or have friends register and fill their
            profiles.
          </p>
        ) : null}
      </div>
    </div>
  );
}
