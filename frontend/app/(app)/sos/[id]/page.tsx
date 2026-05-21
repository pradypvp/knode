"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  apiGet,
  apiPatch,
  apiPost,
  ApiError,
  getSocketBase,
  getToken,
} from "@/lib/api";

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

export default function SosSessionPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<string>("");
  const [otherName, setOtherName] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const joinLiveRoom = useCallback(() => {
    if (!id) return;
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit("sos:join", { sosId: id }, (r: { ok?: boolean }) => {
      if (r && !r.ok) {
        setErr("Could not join live channel (sign in again?)");
      }
    });
  }, [id]);

  const load = useCallback(async () => {
    if (!id) return;
    setErr(null);
    setLoading(true);
    try {
      const detail = await apiGet<{
        sos: {
          title: string;
          description: string | null;
          topicTag: string;
          targetSkill: string;
          bountyKarma: number;
          bonusKarma: number;
          deadlineAt: string | null;
          lockExpiresAt: string | null;
          lockHolderUserId: string | null;
          status: string;
          author: { id: string; name: string | null; email: string };
          pickedBy: { id: string; name: string | null; email: string } | null;
        };
      }>(`/sos/${id}`);
      setTitle(detail.sos.title);
      setStatus(detail.sos.status);
      setErr(null);
      if (user) {
        const other =
          detail.sos.author.id === user.id
            ? detail.sos.pickedBy
            : detail.sos.author;
        setOtherName(other?.name ?? other?.email ?? "Peer");
      }
      const hist = await apiGet<{ messages: Msg[] }>(`/sos/${id}/messages`);
      setMessages(hist.messages);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Could not load session");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!id || !user) return;
    const token = getToken();
    let socket: Socket | undefined;
    try {
      socket = io(getSocketBase(), {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        auth: token ? { token } : {},
      });
      socketRef.current = socket;
      socket.on("connect", () => {
        joinLiveRoom();
      });
      socket.on(
        "sos:message",
        (payload: {
          id: string;
          body: string;
          createdAt: string;
          user: Msg["user"];
        }) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.id)) return prev;
            return [
              ...prev,
              {
                id: payload.id,
                body: payload.body,
                createdAt: payload.createdAt,
                user: payload.user,
              },
            ];
          });
        },
      );
    } catch {
      /* ignore */
    }
    return () => {
      socketRef.current = null;
      socket?.disconnect();
    };
  }, [id, user, joinLiveRoom]);

  useEffect(() => {
    if (status !== "PICKED") return;
    joinLiveRoom();
  }, [status, joinLiveRoom]);

  async function send() {
    if (!id || !draft.trim()) return;
    setErr(null);
    try {
      const data = await apiPost<{ message: Msg }>(`/sos/${id}/messages`, {
        body: draft.trim(),
      });
      setDraft("");
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Send failed");
    }
  }

  if (!user) return null;
  async function pickThis() {
    try {
      await apiPatch(`/sos/${id}/pick`);
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Pick failed");
    }
  }


  const jitsiRoom = `knode-sos-${id}`;
  const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(jitsiRoom)}`;

  if (loading) {
    return (
      <div className="text-sm text-[rgba(240,238,255,0.45)]">Loading…</div>
    );
  }

  if (err && !title) {
    return (
      <div className="max-w-md text-[#ff4d6a]">
        {err}{" "}
        <Link href="/sos" className="text-[#9b87f5] underline">
          Back to SOS
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/sos"
          className="text-[11px] font-mono text-[#9b87f5] hover:underline"
        >
          ← SOS queue
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-syne)] text-[21px] font-bold text-[#f0eeff]">
          {title}
        </h1>
        <p className="mt-1 text-[13px] text-[rgba(240,238,255,0.45)]">
          {status === "PICKED"
            ? `You’re connected with ${otherName}. Use text below; voice & video in the room.`
            : "This SOS is not in an active help session."}
        </p>
      </div>

      {status === "PICKED" ? (
        <>
          <div className="rounded-2xl border border-[rgba(155,135,245,0.15)] bg-[rgba(0,0,0,0.25)] p-4">
            <div className="mb-2 font-mono text-[11px] text-[#9b87f5]">
              Voice & video (browser)
            </div>
            <p className="mb-3 text-[12px] text-[rgba(240,238,255,0.5)]">
              Opens a free Jitsi Meet room. Both of you share the same link — agree
              to mic/camera in the browser.
            </p>
            <a
              href={jitsiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded border border-[rgba(0,229,160,0.35)] bg-[rgba(0,229,160,0.1)] px-4 py-2 text-[13px] font-medium text-[#00e5a0] hover:bg-[rgba(0,229,160,0.18)]"
            >
              Open call room →
            </a>
            <p className="mt-2 font-mono text-[10px] text-[rgba(240,238,255,0.35)]">
              Room: {jitsiRoom}
            </p>
          </div>

          <div className="flex min-h-[280px] flex-col rounded-2xl border border-[rgba(155,135,245,0.15)] bg-[rgba(255,255,255,0.03)]">
            <div className="border-b border-[rgba(155,135,245,0.15)] px-4 py-2 font-mono text-[11px] text-[rgba(240,238,255,0.45)]">
              Text chat
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4 max-h-[360px]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.user.id === user.id
                      ? "ml-auto max-w-[85%] rounded-lg bg-[rgba(155,135,245,0.15)] px-3 py-2 text-[13px] text-[#f0eeff]"
                      : "mr-auto max-w-[85%] rounded-lg bg-[rgba(255,255,255,0.06)] px-3 py-2 text-[13px] text-[#f0eeff]"
                  }
                >
                  <div className="mb-1 font-mono text-[10px] text-[rgba(240,238,255,0.4)]">
                    {m.user.name ?? m.user.email}
                  </div>
                  {m.body}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            {err ? <p className="px-4 text-sm text-[#ff4d6a]">{err}</p> : null}
            <div className="border-t border-[rgba(155,135,245,0.15)] p-3">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask a follow-up, paste code, share screenshots as links…"
                rows={3}
                className="mb-2 border-[rgba(155,135,245,0.2)] bg-[rgba(255,255,255,0.05)] text-[#f0eeff]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => void send()}
                disabled={!draft.trim()}
                className="border border-[rgba(155,135,245,0.3)] bg-[rgba(155,135,245,0.12)] text-[#9b87f5]"
              >
                Send
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-[rgba(155,135,245,0.15)] bg-[rgba(0,0,0,0.2)] p-4">
          <p className="text-sm text-[rgba(240,238,255,0.45)]">
            This SOS is open. Opening this page locks bounty for you briefly; pick now to
            claim.
          </p>
          <Button
            type="button"
            onClick={() => void pickThis()}
            className="mt-3 border border-[rgba(155,135,245,0.3)] bg-[rgba(155,135,245,0.12)] text-[#9b87f5]"
          >
            Pick this SOS
          </Button>
        </div>
      )}
    </div>
  );
}
