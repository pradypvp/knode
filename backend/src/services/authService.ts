import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../config.js";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(userId: string): string {
  const signOptions: SignOptions = {
    expiresIn: config.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign({ sub: userId }, config.JWT_SECRET, signOptions);
}

export function verifyAccessToken(token: string): { sub: string } {
  const payload = jwt.verify(token, config.JWT_SECRET);
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as { sub?: unknown }).sub !== "string"
  ) {
    throw new Error("Invalid token payload");
  }
  return { sub: (payload as { sub: string }).sub };
}
