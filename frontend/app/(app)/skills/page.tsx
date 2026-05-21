"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiGetPublic, apiPut, ApiError } from "@/lib/api";
import { groupSkillsByCategory } from "@/lib/skill-catalog";
import { cn } from "@/lib/utils";

function expandPreview(
  selected: Map<string, number>,
  implies: Record<string, string[]>,
): string[] {
  const out = new Set<string>();
  for (const id of selected.keys()) {
    out.add(id);
    for (const im of implies[id] ?? []) {
      out.add(im.toLowerCase());
    }
  }
  return [...out].sort();
}

export default function SkillsPage() {
  const { user, refresh } = useAuth();
  const [implies, setImplies] = useState<Record<string, string[]>>({});
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiGetPublic<{ implies: Record<string, string[]> }>(
          "/skills/implications",
        );
        setImplies(data.implies);
      } catch {
        setImplies({});
      }
    })();
  }, []);

  useEffect(() => {
    if (!user?.skills?.length) return;
    const next: Record<string, number> = {};
    for (const s of user.skills) {
      next[s.skill] = s.proficiency;
    }
    setLevels(next);
  }, [user]);

  const grouped = useMemo(() => groupSkillsByCategory(), []);

  const toggle = (id: string) => {
    setLevels((prev) => {
      const n = { ...prev };
      if (n[id] !== undefined) {
        delete n[id];
      } else {
        n[id] = 3;
      }
      return n;
    });
  };

  const setLevel = (id: string, v: number) => {
    setLevels((prev) => ({ ...prev, [id]: v }));
  };

  const selectedMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const [k, v] of Object.entries(levels)) {
      if (v >= 1 && v <= 5) m.set(k, v);
    }
    return m;
  }, [levels]);

  const preview = useMemo(
    () => expandPreview(selectedMap, implies),
    [selectedMap, implies],
  );

  /** Skills that will be stored because of inference, not because you ticked them. */
  const inferredOnly = useMemo(
    () => preview.filter((s) => !selectedMap.has(s)),
    [preview, selectedMap],
  );

  const save = useCallback(async () => {
    setError(null);
    setPending(true);
    try {
      const skills = [...selectedMap.entries()].map(([skill, proficiency]) => ({
        skill,
        proficiency,
      }));
      await apiPut("/skills/me", { skills });
      await refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed");
    } finally {
      setPending(false);
    }
  }, [selectedMap, refresh]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-syne)] text-[21px] font-bold text-[#f0eeff]">
          Skills
        </h1>
        <p className="mt-1 text-[13px] text-[rgba(240,238,255,0.45)]">
          Select skills and set proficiency (1–5). The server adds implied
          prerequisites (e.g. TensorFlow → Python) for matching.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-[rgba(155,135,245,0.15)] bg-[rgba(0,229,160,0.06)] p-4">
        <div className="font-mono text-[11px] text-[#00e5a0]">
          Stored skill graph (preview)
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-[rgba(240,238,255,0.6)]">
          {preview.length === 0
            ? "Nothing selected yet."
            : preview.join(", ")}
        </p>
        {inferredOnly.length > 0 ? (
          <p className="mt-2 text-[11px] text-[rgba(240,238,255,0.4)]">
            Inferred on save: {inferredOnly.join(", ")}
          </p>
        ) : null}
      </div>

      {error ? <p className="mb-4 text-sm text-[#ff4d6a]">{error}</p> : null}

      <div className="flex flex-col gap-8">
        {[...grouped.entries()].map(([category, skills]) => (
          <div key={category}>
            <h2 className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[1px] text-[rgba(240,238,255,0.35)]">
              {category}
            </h2>
            <div className="flex flex-col gap-2">
              {skills.map((s) => {
                const active = levels[s.id] !== undefined;
                const prof = levels[s.id] ?? 3;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 transition",
                      active
                        ? "border-[rgba(155,135,245,0.35)] bg-[rgba(155,135,245,0.08)]"
                        : "border-[rgba(255,255,255,0.06)] bg-transparent",
                    )}
                  >
                    <label className="flex min-w-[180px] flex-1 cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggle(s.id)}
                        className="h-4 w-4 rounded border-[rgba(155,135,245,0.4)]"
                      />
                      <span className="text-[13px] text-[#f0eeff]">{s.label}</span>
                    </label>
                    {active ? (
                      <div className="flex items-center gap-2">
                        <Label className="text-[10px] text-[rgba(240,238,255,0.45)]">
                          1–5
                        </Label>
                        <input
                          type="range"
                          min={1}
                          max={5}
                          value={prof}
                          onChange={(e) =>
                            setLevel(s.id, parseInt(e.target.value, 10))
                          }
                          className="w-28 accent-[#9b87f5]"
                        />
                        <span className="w-6 font-mono text-[12px] text-[#9b87f5]">
                          {prof}
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        disabled={pending}
        onClick={() => void save()}
        className="mt-8 border border-[rgba(155,135,245,0.3)] bg-[rgba(155,135,245,0.12)] text-[#9b87f5] hover:bg-[rgba(155,135,245,0.2)]"
      >
        {pending ? "Saving…" : "Save skills"}
      </Button>
    </div>
  );
}
