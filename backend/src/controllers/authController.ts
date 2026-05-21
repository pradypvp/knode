import type { Request, Response } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler.js";
import { getPrisma } from "../models/prisma.js";
import {
  hashPassword,
  signAccessToken,
  verifyPassword,
} from "../services/authService.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function publicUser(u: {
  id: string;
  email: string;
  name: string | null;
  credibilityScore: number;
  karmaBalance: number;
}) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    credibilityScore: u.credibilityScore,
    karmaBalance: u.karmaBalance,
  };
}

export async function postRegister(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid request body", parsed.error.flatten());
  }
  const { email, password, name } = parsed.data;
  const prisma = getPrisma();
  const passwordHash = await hashPassword(password);
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: name ?? null,
          passwordHash,
        },
      });
      await tx.karmaLedgerEntry.create({
        data: {
          userId: u.id,
          delta: 100,
          balanceAfter: 100,
          reason: "INITIAL_GRANT",
          correlationId: `initial:${u.id}`,
        },
      });
      return u;
    });
    const token = signAccessToken(user.id);
    res.status(201).json({ user: publicUser(user), token });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      throw new HttpError(409, "Email already registered");
    }
    throw err;
  }
}

export async function postLogin(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid request body", parsed.error.flatten());
  }
  const { email, password } = parsed.data;
  const prisma = getPrisma();
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "Invalid email or password");
  }
  const token = signAccessToken(user.id);
  res.json({ user: publicUser(user), token });
}
