"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  apiGetPublic,
  apiPost,
  ApiError,
} from "@/lib/api";
import { cn } from "@/lib/utils";

export type CommunityCategory = "HACKATHON" | "DSA_ARENA" | "STUDY_POD";

type ListingRow = {
  id: string;
  category: string;
  title: string;
  theme: string | null;
  stack: string[];
  openSlots: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    department: string | null;
  };
};

export function CommunityBoard({
  category,
  heading,
  subtitle,
}: {
  category: CommunityCategory;
  heading: string;
  subtitle: string;
}) {
  const [items, setItems] = useState<ListingRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [stackRaw, setStackRaw] = useState("");
  const [slots, setSlots] = useState("2");
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const data = await apiGetPublic<{ items: ListingRow[] }>(
        `/community/listings?category=${category}`,
      );
      setItems(data.items);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    setErr(null);
    setPending(true);
    try {
      const stack = stackRaw
        .split(/[,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      await apiPost("/community/listings", {
        category,
        title: title.trim(),
        theme: theme.trim() || undefined,
        stack,
        openSlots: parseInt(slots, 10) || 1,
      });
      setTitle("");
      setTheme("");
      setStackRaw("");
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not create");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-[21px] font-bold text-[#f0eeff]">
          {heading}
        </h1>
        <p className="mt-1 text-[13px] text-[rgba(240,238,255,0.45)]">
          {subtitle}
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-[rgba(155,135,245,0.15)] bg-[rgba(255,255,255,0.03)] p-5">
        <h2 className="mb-4 font-[family-name:var(--font-syne)] text-sm font-semibold text-[#f0eeff]">
          Create listing
        </h2>
        {err ? (
          <p className="mb-3 text-sm text-[#ff4d6a]">{err}</p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="text-[rgba(240,238,255,0.55)]">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hack the North squad"
              className="mt-1 border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
            />
          </div>
          <div>
            <Label className="text-[rgba(240,238,255,0.55)]">Theme / focus</Label>
            <Input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="AI × health"
              className="mt-1 border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
            />
          </div>
          <div>
            <Label className="text-[rgba(240,238,255,0.55)]">Open slots</Label>
            <Input
              inputMode="numeric"
              value={slots}
              onChange={(e) => setSlots(e.target.value)}
              className="mt-1 border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)]"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-[rgba(240,238,255,0.55)]">
              Stack (comma-separated)
            </Label>
            <Input
              value={stackRaw}
              onChange={(e) => setStackRaw(e.target.value)}
              placeholder="python, react, pytorch"
              className="mt-1 border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
            />
          </div>
        </div>
        <Button
          type="button"
          disabled={pending || title.trim().length < 3}
          onClick={() => void create()}
          className="mt-4 border border-[rgba(0,229,160,0.3)] bg-[rgba(0,229,160,0.12)] text-[#00e5a0] hover:bg-[rgba(0,229,160,0.2)]"
        >
          {pending ? "Creating…" : "Publish listing"}
        </Button>
      </div>

      <h2 className="mb-4 font-[family-name:var(--font-syne)] text-sm font-semibold text-[#f0eeff]">
        Open listings
      </h2>
      {loading ? (
        <p className="text-sm text-[rgba(240,238,255,0.45)]">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[rgba(240,238,255,0.45)]">
          Nothing here yet — create one above.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((h) => (
            <div
              key={h.id}
              className={cn(
                "rounded-xl border border-[rgba(155,135,245,0.15)] bg-gradient-to-br from-[rgba(155,135,245,0.06)] to-[rgba(155,135,245,0.02)] p-5",
              )}
            >
              <div className="font-[family-name:var(--font-syne)] text-sm font-semibold text-[#f0eeff]">
                {h.title}
              </div>
              {h.theme ? (
                <div className="mt-1 text-[11px] text-[rgba(240,238,255,0.35)]">
                  {h.theme}
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-1">
                {h.stack.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 font-mono text-[10px] text-[rgba(240,238,255,0.6)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-[rgba(240,238,255,0.35)]">
                <span>
                  {h.user.name ?? h.user.email}
                  {h.user.department ? ` · ${h.user.department}` : ""}
                </span>
                <span className="font-mono text-[#00e5a0]">
                  +{h.openSlots} open
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
