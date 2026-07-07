import { Router } from "express";
import { db, accountsTable, showroomsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  verifyPassword,
  signToken,
  requireAccount,
  loadAccountWithShowroom,
  type AccountRequest,
} from "../lib/accountAuth";

const router = Router();

function showroomResponse(s: any) {
  if (!s) return null;
  return {
    id: s.id,
    name: s.name,
    imageUrl: s.imageUrl,
    googleMapsUrl: s.googleMapsUrl,
    phone: s.phone,
    verified: s.verified,
  };
}

// POST /api/auth/login
router.post("/auth/login", async (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }

    const [account] = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.username, String(username).trim().toLowerCase()));

    if (!account || !verifyPassword(password, account.passwordHash)) {
      return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    }

    let showroom = null;
    if (account.showroomId) {
      const [s] = await db.select().from(showroomsTable).where(eq(showroomsTable.id, account.showroomId));
      showroom = s ?? null;
    }

    const token = signToken({
      sub: account.id,
      username: account.username,
      role: account.role,
      showroomId: account.showroomId ?? null,
    });

    res.json({
      token,
      username: account.username,
      role: account.role,
      showroom: showroomResponse(showroom),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/auth/me", requireAccount, async (req: any, res: any) => {
  try {
    const account = (req as AccountRequest).account!;
    const loaded = await loadAccountWithShowroom(account.sub);
    if (!loaded) return res.status(401).json({ error: "Unauthorized" });

    res.json({
      username: loaded.account.username,
      role: loaded.account.role,
      showroom: showroomResponse(loaded.showroom),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
