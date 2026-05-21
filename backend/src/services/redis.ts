import { Redis } from "ioredis";
import { config } from "../config.js";

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (!config.REDIS_URL) {
    return null;
  }
  if (!client) {
    client = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });
    client.on("error", (err: Error) => {
      console.error("Redis connection error", err);
    });
  }
  return client;
}
