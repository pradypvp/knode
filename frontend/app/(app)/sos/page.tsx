"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
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
import { Textarea } from "@/components/ui/textarea";
import {
  apiGet,
  apiPatch,
  apiPost,
  ApiError,
  getSocketBase,
} from "@/lib/api";

type SosItem = {
  id: string;
  title: string;
  description: string | null;
  topicTag: string;
  targetSkill: string;
  bountyKarma: number;
  bonusKarma: number;
  deadlineAt: string | null;
  lockExpiresAt: string | null;
  lockHolderUserId: string | null;
  createdAt: string;
  author: { id: string; name: string | null; credibilityScore: number };
};

type SessionRow = {
  id: string;
  title: string;
  role: "author" | "helper";
};

export default function SosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<SosItem[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topicTag, setTopicTag] = useState("general");
  const [targetSkill, setTargetSkill] = useState("python");
  const [deadlineHours, setDeadlineHours] = useState("4");
  const [bounty, setBounty] = useState("0");
  const [urgency, setUrgency] = useState("0.55");
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    const data = await apiGet<{ items: SosItem[] }>("/sos");
    setItems(data.items);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadSessions = useCallback(async () => {
    try {
      const data = await apiGet<{ items: SessionRow[] }>("/sos/sessions");
      setSessions(data.items);
    } catch {
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    let socket: Socket | undefined;
    try {
      socket = io(getSocketBase(), {
        path: "/socket.io",
        transports: ["websocket", "polling"],
      });
      socket.on("sos:new", (payload: { id: string; title: string }) => {
        setLog((prev) => [
          `New SOS: ${payload.title}`,
          ...prev.slice(0, 19),
        ]);
        void load();
      });
      socket.on("sos:picked", (payload: { id: string }) => {
        setLog((prev) => [
          `Picked: ${payload.id}`,
          ...prev.slice(0, 19),
        ]);
        void load();
        void loadSessions();
      });
    } catch {
      /* ignore */
    }
    return () => {
      socket?.disconnect();
    };
  }, [load, loadSessions]);

  const suggestBounty = useCallback(async () => {
    setError(null);
    try {
      const u = Math.min(1, Math.max(0, parseFloat(urgency) || 0.5));
      const data = await apiPost<{
        suggestedBounty: number;
        rationale: string;
      }>("/sos/suggest-bounty", {
        urgency: u,
        queueDepth: items.length,
      });
      setBounty(String(data.suggestedBounty));
      setLog((prev) => [
        `AI bounty: ${data.suggestedBounty} (${data.rationale})`,
        ...prev.slice(0, 19),
      ]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Bounty suggest failed");
    }
  }, [urgency, items.length]);

  const create = useCallback(async () => {
    setError(null);
    setPending(true);
    try {
      await apiPost("/sos", {
        title,
        description: description || undefined,
        topicTag,
        targetSkill,
        deadlineHours: parseFloat(deadlineHours) || 4,
        bountyKarma: parseInt(bounty, 10) || 0,
      });
      setTitle("");
      setDescription("");
      setTopicTag("general");
      setTargetSkill("python");
      setDeadlineHours("4");
      setBounty("0");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not create SOS");
    } finally {
      setPending(false);
    }
  }, [title, description, topicTag, targetSkill, deadlineHours, bounty, load]);

  const pick = useCallback(
    async (sid: string) => {
      setError(null);
      try {
        await apiPatch(`/sos/${sid}/pick`);
        await load();
        await loadSessions();
        router.push(`/sos/${sid}`);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Pick failed");
      }
    },
    [load, loadSessions, router],
  );

  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6">
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-[21px] font-bold text-[#f0eeff]">
          SOS Queue
        </h1>
        <p className="mt-1 text-[13px] text-[rgba(240,238,255,0.45)]">
          Real-time via Socket.io; bounty spends karma from your balance
        </p>
      </div>

      <Card className="border-[rgba(155,135,245,0.15)] bg-[rgba(255,255,255,0.03)]">
        <CardHeader>
          <CardTitle className="text-[#f0eeff]">Raise SOS</CardTitle>
          <CardDescription className="text-[rgba(240,238,255,0.45)]">
            Urgent help request visible to everyone online
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-[rgba(240,238,255,0.55)]">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Stuck on proof in assignment 4"
              className="border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="desc" className="text-[rgba(240,238,255,0.55)]">
              Details
            </Label>
            <Textarea
              id="desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
            />
          </div>
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="topic" className="text-[rgba(240,238,255,0.55)]">
              Topic tag
            </Label>
            <Input
              id="topic"
              value={topicTag}
              onChange={(e) => setTopicTag(e.target.value)}
              className="border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)]"
            />
          </div>
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="targetSkill" className="text-[rgba(240,238,255,0.55)]">
              Target skill
            </Label>
            <Input
              id="targetSkill"
              value={targetSkill}
              onChange={(e) => setTargetSkill(e.target.value)}
              className="border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)]"
            />
          </div>
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="deadline" className="text-[rgba(240,238,255,0.55)]">
              Deadline (hours)
            </Label>
            <Input
              id="deadline"
              inputMode="decimal"
              value={deadlineHours}
              onChange={(e) => setDeadlineHours(e.target.value)}
              className="border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)]"
            />
          </div>
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="bounty" className="text-[rgba(240,238,255,0.55)]">
              Bounty (karma)
            </Label>
            <Input
              id="bounty"
              inputMode="numeric"
              value={bounty}
              onChange={(e) => setBounty(e.target.value)}
              className="border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)]"
            />
          </div>
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="urgency" className="text-[rgba(240,238,255,0.55)]">
              Urgency (0–1 for AI)
            </Label>
            <Input
              id="urgency"
              inputMode="decimal"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)]"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void suggestBounty()}
            className="border border-[rgba(245,166,35,0.25)] bg-[rgba(245,166,35,0.1)] text-[#f5a623]"
          >
            AI suggest bounty (minimax)
          </Button>
          {error ? <p className="text-sm text-[#ff4d6a]">{error}</p> : null}
          <Button
            type="button"
            disabled={pending || title.trim().length < 3}
            onClick={() => void create()}
            className="w-fit border border-[rgba(0,229,160,0.3)] bg-[rgba(0,229,160,0.12)] text-[#00e5a0] hover:bg-[rgba(0,229,160,0.2)]"
          >
            {pending ? "Posting…" : "Post SOS"}
          </Button>
        </CardContent>
      </Card>

      {log.length > 0 ? (
        <Card
          size="sm"
          className="border-[rgba(155,135,245,0.12)] bg-[rgba(0,0,0,0.2)]"
        >
          <CardHeader>
            <CardTitle className="text-base text-[#f0eeff]">Live</CardTitle>
            <CardDescription className="text-[rgba(240,238,255,0.45)]">
              Socket events on this browser
            </CardDescription>
          </CardHeader>
          <CardContent className="font-mono text-xs text-[rgba(240,238,255,0.45)]">
            {log.map((line, i) => (
              <div key={`${i}-${line}`}>{line}</div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {sessions.length > 0 ? (
        <Card className="border-[rgba(0,229,160,0.2)] bg-[rgba(0,229,160,0.06)]">
          <CardHeader>
            <CardTitle className="text-base text-[#00e5a0]">
              Active help sessions
            </CardTitle>
            <CardDescription className="text-[rgba(240,238,255,0.45)]">
              Text chat + optional Jitsi call — open the session to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/sos/${s.id}`}
                className="flex items-center justify-between rounded-lg border border-[rgba(0,229,160,0.2)] bg-[rgba(0,0,0,0.2)] px-3 py-2 text-[13px] text-[#f0eeff] transition hover:border-[rgba(0,229,160,0.4)]"
              >
                <span className="truncate">{s.title}</span>
                <span className="shrink-0 font-mono text-[10px] text-[rgba(240,238,255,0.45)]">
                  {s.role === "author" ? "You asked" : "You’re helping"}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-[#f0eeff]">
          Open requests
        </h2>
        {items.map((s) => (
          <Card
            key={s.id}
            size="sm"
            className="border-[rgba(155,135,245,0.12)] bg-[rgba(0,0,0,0.2)]"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base text-[#f0eeff]">{s.title}</CardTitle>
                <CardDescription className="text-[rgba(240,238,255,0.45)]">
                  {s.author.name ?? "User"} · {s.topicTag} · skill {s.targetSkill} ·
                  bounty {s.bountyKarma}
                  {s.bonusKarma > 0 ? ` + bonus ${s.bonusKarma}` : ""}
                </CardDescription>
              </div>
              {s.author.id !== user.id ? (
                <div className="flex items-center gap-2">
                  <Link href={`/sos/${s.id}`} className="text-xs text-[#9b87f5] underline">
                    View & lock
                  </Link>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => void pick(s.id)}
                    className="border border-[rgba(155,135,245,0.25)] bg-[rgba(155,135,245,0.1)] text-[#9b87f5]"
                  >
                    Pick up
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-[rgba(240,238,255,0.35)]">
                  Yours
                </span>
              )}
            </CardHeader>
            {s.description ? (
              <CardContent className="text-sm text-[rgba(240,238,255,0.55)]">
                {s.description}
                {s.deadlineAt ? (
                  <p className="mt-2 text-xs text-[rgba(240,238,255,0.45)]">
                    Deadline: {new Date(s.deadlineAt).toLocaleString()}
                  </p>
                ) : null}
              </CardContent>
            ) : null}
          </Card>
        ))}
        {items.length === 0 ? (
          <p className="text-sm text-[rgba(240,238,255,0.45)]">
            No open SOS items.
          </p>
        ) : null}
      </div>
    </div>
  );
}
