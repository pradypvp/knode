import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import { config } from "../config.js";

const schema = z.object({
  urgency: z.number().min(0).max(1).default(0.5),
  queueDepth: z.number().int().min(0).default(0),
});

export async function postSuggestBounty(
  req: Request,
  res: Response
): Promise<void> {
  if (!config.AI_ENGINE_URL) {
    throw new HttpError(503, "AI engine not configured");
  }
  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) {
    throw new HttpError(400, "Invalid request body", parsed.error.flatten());
  }
  let r: globalThis.Response;
  try {
    r = await fetch(`${config.AI_ENGINE_URL}/sos/bounty`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urgency: parsed.data.urgency,
        queueDepth: parsed.data.queueDepth,
      }),
    });
  } catch {
    throw new HttpError(502, "AI engine unavailable. Start ai-engine/run.sh");
  }
  if (!r.ok) {
    throw new HttpError(502, "AI engine bounty request failed");
  }
  const data = (await r.json()) as {
    suggestedBounty: number;
    gameValue: number;
    rationale: string;
  };
  res.json(data);
}
