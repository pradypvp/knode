"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { apiGet, apiPost, ApiError } from "@/lib/api";

type UserLite = {
  id: string;
  email: string;
  name: string | null;
  credibilityScore: number;
  karmaBalance: number;
};

type ReqRow = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  fromUser: UserLite;
  toUser: UserLite;
};

type ConnectionsPayload = {
  connections: Array<{ user: UserLite; since: string }>;
  incoming: ReqRow[];
  outgoing: ReqRow[];
};

function PersonPill({ u }: { u: UserLite }) {
  const initials =
    (u.name ?? u.email)
      .split(/\s+/)
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[rgba(155,135,245,0.15)] bg-[rgba(0,0,0,0.2)] px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(155,135,245,0.25)] bg-[rgba(155,135,245,0.08)] text-[12px] font-bold text-[#9b87f5]">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-[#f0eeff]">
          {u.name ?? "Anonymous"}
        </div>
        <div className="mt-0.5 truncate font-mono text-[11px] text-[rgba(240,238,255,0.45)]">
          {u.email} · cred {u.credibilityScore} · karma {u.karmaBalance}
        </div>
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ConnectionsPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const res = await apiGet<ConnectionsPayload>("/connections");
      setData(res);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed to load connections");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user, load]);

  const act = async (path: string, busyKey: string) => {
    setBusy(busyKey);
    setErr(null);
    try {
      await apiPost(path, {});
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-[21px] font-bold text-[#f0eeff]">
            Connections
          </h1>
          <p className="mt-1 text-[13px] text-[rgba(240,238,255,0.45)]">
            Manage requests and your connected peers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-md border border-[rgba(155,135,245,0.2)] bg-[rgba(155,135,245,0.08)] px-2.5 py-1 font-mono text-[11px] text-[#9b87f5] transition hover:bg-[rgba(155,135,245,0.15)]"
        >
          Refresh
        </button>
      </div>

      {err ? <p className="text-sm text-[#ff4d6a]">{err}</p> : null}

      <div className="grid gap-3">
        <div className="rounded-2xl border border-[rgba(155,135,245,0.15)] bg-[rgba(0,0,0,0.25)] p-5">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[11px] uppercase tracking-wide text-[rgba(240,238,255,0.45)]">
              Incoming requests
            </div>
            <div className="font-mono text-[11px] text-[rgba(240,238,255,0.35)]">
              {(data?.incoming?.length ?? 0).toString()}
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {(data?.incoming ?? []).length === 0 ? (
              <p className="text-sm text-[rgba(240,238,255,0.45)]">
                No incoming requests.
              </p>
            ) : (
              data!.incoming.map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <PersonPill u={r.fromUser} />
                  </div>
                  <button
                    type="button"
                    disabled={busy === `a:${r.id}`}
                    onClick={() => void act(`/connections/${r.id}/accept`, `a:${r.id}`)}
                    className="rounded-[9px] border border-[rgba(0,229,160,0.3)] bg-[rgba(0,229,160,0.10)] px-3 py-2 font-mono text-[11px] font-semibold text-[#00e5a0] transition hover:bg-[rgba(0,229,160,0.16)] disabled:opacity-60"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    disabled={busy === `d:${r.id}`}
                    onClick={() => void act(`/connections/${r.id}/decline`, `d:${r.id}`)}
                    className="rounded-[9px] border border-[rgba(255,77,106,0.3)] bg-[rgba(255,77,106,0.08)] px-3 py-2 font-mono text-[11px] font-semibold text-[#ff4d6a] transition hover:bg-[rgba(255,77,106,0.12)] disabled:opacity-60"
                  >
                    Decline
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(155,135,245,0.15)] bg-[rgba(0,0,0,0.25)] p-5">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[11px] uppercase tracking-wide text-[rgba(240,238,255,0.45)]">
              Outgoing requests
            </div>
            <div className="font-mono text-[11px] text-[rgba(240,238,255,0.35)]">
              {(data?.outgoing?.length ?? 0).toString()}
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {(data?.outgoing ?? []).length === 0 ? (
              <p className="text-sm text-[rgba(240,238,255,0.45)]">
                No outgoing requests.
              </p>
            ) : (
              data!.outgoing.map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <PersonPill u={r.toUser} />
                  </div>
                  <button
                    type="button"
                    disabled={busy === `c:${r.id}`}
                    onClick={() => void act(`/connections/${r.id}/cancel`, `c:${r.id}`)}
                    className="rounded-[9px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-3 py-2 font-mono text-[11px] font-semibold text-[rgba(240,238,255,0.7)] transition hover:border-[rgba(155,135,245,0.35)] hover:bg-[rgba(155,135,245,0.06)] hover:text-[#9b87f5] disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(155,135,245,0.15)] bg-[rgba(0,0,0,0.25)] p-5">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[11px] uppercase tracking-wide text-[rgba(240,238,255,0.45)]">
              Your connections
            </div>
            <div className="font-mono text-[11px] text-[rgba(240,238,255,0.35)]">
              {(data?.connections?.length ?? 0).toString()}
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {(data?.connections ?? []).length === 0 ? (
              <p className="text-sm text-[rgba(240,238,255,0.45)]">
                No connections yet — send requests from the Match cards.
              </p>
            ) : (
              data!.connections.map((c) => (
                <div key={c.user.id} className="flex flex-col gap-2">
                  <PersonPill u={c.user} />
                  <div className="px-1 font-mono text-[10px] text-[rgba(240,238,255,0.35)]">
                    Connected {new Date(c.since).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

