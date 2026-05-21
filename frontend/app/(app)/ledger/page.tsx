"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { apiGet, ApiError } from "@/lib/api";
import { formatKarmaDisplay } from "@/lib/format-karma";

type LedgerEntry = {
  id: string;
  delta: number;
  balanceAfter: number;
  reason: string;
  createdAt: string;
};

export default function LedgerPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiGet<{ entries: LedgerEntry[] }>("/karma/ledger");
        setEntries(data.entries);
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : "Failed to load ledger");
      }
    })();
  }, []);

  if (!user) return null;

  const earned = entries
    .filter((e) => e.delta > 0)
    .reduce((a, e) => a + e.delta, 0);
  const spent = entries
    .filter((e) => e.delta < 0)
    .reduce((a, e) => a + Math.abs(e.delta), 0);

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-[21px] font-bold text-[#f0eeff]">
          Karma Ledger
        </h1>
        <p className="mt-1 text-[13px] text-[rgba(240,238,255,0.35)]">
          Immutable audit trail for karma movements
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[14px] border border-[rgba(155,135,245,0.15)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] to-[rgba(155,135,245,0.03)] p-5">
          <div className="font-mono text-[10px] uppercase tracking-wide text-[rgba(240,238,255,0.35)]">
            Balance
          </div>
          <div className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-[#9b87f5]">
            {formatKarmaDisplay(user.karmaBalance)}
          </div>
        </div>
        <div className="rounded-[14px] border border-[rgba(155,135,245,0.15)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] to-[rgba(155,135,245,0.03)] p-5">
          <div className="font-mono text-[10px] uppercase tracking-wide text-[rgba(240,238,255,0.35)]">
            Total earned (visible)
          </div>
          <div className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-[#06b6d4]">
            +{formatKarmaDisplay(earned)}
          </div>
        </div>
        <div className="rounded-[14px] border border-[rgba(155,135,245,0.15)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] to-[rgba(155,135,245,0.03)] p-5">
          <div className="font-mono text-[10px] uppercase tracking-wide text-[rgba(240,238,255,0.35)]">
            Total spent (visible)
          </div>
          <div className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-[#00e5a0]">
            {formatKarmaDisplay(spent)}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[rgba(155,135,245,0.15)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] to-[rgba(155,135,245,0.02)]">
        <div className="flex items-center justify-between border-b border-[rgba(155,135,245,0.15)] px-5 py-4">
          <h2 className="font-[family-name:var(--font-syne)] text-sm font-semibold">
            Transaction log
          </h2>
          <span className="font-mono text-[10px] text-[rgba(240,238,255,0.35)]">
            Newest first
          </span>
        </div>
        {err ? (
          <p className="p-5 text-sm text-[#ff4d6a]">{err}</p>
        ) : entries.length === 0 ? (
          <p className="p-8 text-center text-sm text-[rgba(240,238,255,0.45)]">
            No ledger lines yet. Transfer karma or complete sessions to populate.
          </p>
        ) : (
          <div>
            {entries.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 border-b border-[rgba(155,135,245,0.1)] px-5 py-3.5 transition hover:bg-[rgba(155,135,245,0.03)] last:border-0"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-lg"
                  style={{
                    background:
                      t.delta > 0
                        ? "rgba(0,229,160,0.1)"
                        : "rgba(255,77,106,0.1)",
                  }}
                >
                  <span
                    style={{ color: t.delta > 0 ? "#00e5a0" : "#ff4d6a" }}
                  >
                    {t.delta > 0 ? "↑" : "↓"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-[#f0eeff]">{t.reason}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-[rgba(240,238,255,0.35)]">
                    {t.id.slice(0, 8)}… ·{" "}
                    {new Date(t.createdAt).toLocaleString()}
                  </div>
                </div>
                <div
                  className="shrink-0 font-mono text-sm font-bold"
                  style={{ color: t.delta > 0 ? "#00e5a0" : "#ff4d6a" }}
                >
                  {t.delta > 0 ? "+" : ""}
                  {t.delta}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
