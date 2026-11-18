import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { db, accountsTable, showroomsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const SECRET = process.env.SESSION_SECRET;
if (!SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

// ---------------- Password hashing (scrypt) ----------------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hash] = parts;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

// ---------------- Token sign/verify (HMAC-SHA256) ----------------

export interface AccountTokenPayload {
  sub: number;
  username: string;
  role: string;
  showroomId: number | null;
  exp: number;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signToken(payload: Omit<AccountTokenPayload, "exp">): string {
  const full: AccountTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const body = b64url(JSON.stringify(full));
  const sig = crypto.createHmac("sha256", SECRET!).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token: string): AccountTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac("sha256", SECRET!).update(body).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as AccountTokenPayload;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------------- Express middlewares ----------------

export interface AccountRequest extends Request {
  account?: AccountTokenPayload;
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export function getAccount(req: Request): AccountTokenPayload | null {
  const token = extractToken(req);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAccount(req: AccountRequest, res: Response, next: NextFunction): void {
  const account = getAccount(req);
  if (!account) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.account = account;
  next();
}

async function revalidateAccount(payload: AccountTokenPayload): Promise<boolean> {
  const [dbAccount] = await db
    .select({
      id: accountsTable.id,
      role: accountsTable.role,
      showroomId: accountsTable.showroomId,
    })
    .from(accountsTable)
    .where(eq(accountsTable.id, payload.sub));
  if (!dbAccount) return false;
  if (dbAccount.role !== payload.role) return false;
  if ((dbAccount.showroomId ?? null) !== (payload.showroomId ?? null)) return false;
  return true;
}

export function requireAdminAccount(req: AccountRequest, res: Response, next: NextFunction): void {
  const account = getAccount(req);
  if (!account) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (account.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  revalidateAccount(account)
    .then((valid) => {
      if (!valid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      req.account = account;
      next();
    })
    .catch(next);
}

export function requireShowroomAccount(req: AccountRequest, res: Response, next: NextFunction): void {
  const account = getAccount(req);
  if (!account) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (account.role !== "showroom" || !account.showroomId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  revalidateAccount(account)
    .then((valid) => {
      if (!valid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      req.account = account;
      next();
    })
    .catch(next);
}

// ---------------- Helpers ----------------

export async function loadAccountWithShowroom(accountId: number) {
  const [account] = await db.select().from(accountsTable).where(eq(accountsTable.id, accountId));
  if (!account) return null;
  let showroom = null;
  if (account.showroomId) {
    const [s] = await db.select().from(showroomsTable).where(eq(showroomsTable.id, account.showroomId));
    showroom = s ?? null;
  }
  return { account, showroom };
}
