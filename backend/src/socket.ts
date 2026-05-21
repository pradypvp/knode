import { createServer } from "node:http";
import type { Express } from "express";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { config } from "./config.js";
import { verifyAccessToken } from "./services/authService.js";
import { canAccessSosSession, sosSessionRoom } from "./services/sosService.js";
import { getRedis } from "./services/redis.js";

let io: Server | null = null;

export function getIo(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export function createHttpServer(app: Express) {
  const httpServer = createServer(app);
  io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin:
        config.corsOrigins.length > 1
          ? config.corsOrigins
          : config.corsOrigins[0],
      methods: ["GET", "POST"],
    },
  });
  const pub = getRedis();
  if (pub) {
    const sub = pub.duplicate();
    io.adapter(createAdapter(pub, sub));
  }

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (token) {
      try {
        const { sub } = verifyAccessToken(token);
        socket.data.userId = sub;
      } catch {
        return next(new Error("unauthorized"));
      }
    }
    next();
  });

  io.on("connection", (socket) => {
    void socket.join("sos");

    socket.on(
      "sos:join",
      async (
        payload: { sosId?: string },
        cb?: (r: { ok: boolean; error?: string }) => void
      ) => {
        const sosId = payload?.sosId;
        const userId = socket.data.userId as string | undefined;
        if (!sosId || typeof sosId !== "string") {
          cb?.({ ok: false, error: "bad_request" });
          return;
        }
        if (!userId) {
          cb?.({ ok: false, error: "auth_required" });
          return;
        }
        try {
          const allowed = await canAccessSosSession(sosId, userId);
          if (!allowed) {
            cb?.({ ok: false, error: "forbidden" });
            return;
          }
          await socket.join(sosSessionRoom(sosId));
          cb?.({ ok: true });
        } catch {
          cb?.({ ok: false, error: "server" });
        }
      }
    );
  });
  return httpServer;
}
