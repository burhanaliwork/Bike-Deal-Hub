import { Router } from "express";
import { db, accountsTable, showroomsTable, bikesTable } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import {
  hashPassword,
  requireAdminAccount,
  requireShowroomAccount,
  type AccountRequest,
} from "../lib/accountAuth";

const router = Router();

function showroomResponse(s: any, extra: Record<string, any> = {}) {
  return {
    id: s.id,
    name: s.name,
    imageUrl: s.imageUrl,
    googleMapsUrl: s.googleMapsUrl,
    phone: s.phone,
    verified: s.verified,
    createdAt: s.createdAt,
    ...extra,
  };
}

function buildBikeResponse(bike: any, showroom: any = null) {
  return {
    ...bike,
    price: bike.price != null ? parseFloat(bike.price) : null,
    isFavorited: false,
    showroom: showroom
      ? {
          id: showroom.id,
          name: showroom.name,
          imageUrl: showroom.imageUrl,
          googleMapsUrl: showroom.googleMapsUrl,
          phone: showroom.phone,
          verified: showroom.verified,
        }
      : null,
  };
}

// ---------------- Public ----------------

// GET /api/showrooms/:id — public showroom profile
router.get("/showrooms/:id", async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [showroom] = await db.select().from(showroomsTable).where(eq(showroomsTable.id, id));
    if (!showroom) return res.status(404).json({ error: "Not found" });

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bikesTable)
      .where(and(eq(bikesTable.showroomId, id), eq(bikesTable.status, "active")));

    res.json(showroomResponse(showroom, { bikesCount: countRow.count }));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------- Admin: showroom management ----------------

// GET /api/admin/showrooms
router.get("/admin/showrooms", requireAdminAccount, async (req: any, res: any) => {
  try {
    const showrooms = await db.select().from(showroomsTable).orderBy(desc(showroomsTable.createdAt));

    const result = await Promise.all(
      showrooms.map(async (s) => {
        const [accountRow] = await db
          .select()
          .from(accountsTable)
          .where(eq(accountsTable.showroomId, s.id));
        const [countRow] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(bikesTable)
          .where(eq(bikesTable.showroomId, s.id));
        return showroomResponse(s, {
          username: accountRow?.username ?? null,
          bikesCount: countRow.count,
        });
      }),
    );

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/showrooms — create showroom + its account
router.post("/admin/showrooms", requireAdminAccount, async (req: any, res: any) => {
  try {
    const { name, imageUrl, googleMapsUrl, phone, username, password } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,30}$/.test(cleanUsername)) {
      return res.status(400).json({ error: "اسم المستخدم يجب أن يكون بالإنجليزية (3-30 حرف/رقم)" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    const [existing] = await db.select().from(accountsTable).where(eq(accountsTable.username, cleanUsername));
    if (existing) {
      return res.status(409).json({ error: "اسم المستخدم موجود مسبقاً" });
    }

    const [showroom] = await db
      .insert(showroomsTable)
      .values({ name, imageUrl, googleMapsUrl, phone, verified: true })
      .returning();

    await db.insert(accountsTable).values({
      username: cleanUsername,
      passwordHash: hashPassword(String(password)),
      role: "showroom",
      showroomId: showroom.id,
    });

    res.status(201).json(showroomResponse(showroom, { username: cleanUsername, bikesCount: 0 }));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/showrooms/:id — update showroom (and optionally reset password)
router.put("/admin/showrooms/:id", requireAdminAccount, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db.select().from(showroomsTable).where(eq(showroomsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });

    const { name, imageUrl, googleMapsUrl, phone, verified, password } = req.body;

    const [updated] = await db
      .update(showroomsTable)
      .set({
        ...(name && { name }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(googleMapsUrl !== undefined && { googleMapsUrl }),
        ...(phone !== undefined && { phone }),
        ...(verified !== undefined && { verified: !!verified }),
      })
      .where(eq(showroomsTable.id, id))
      .returning();

    if (password) {
      if (String(password).length < 6) {
        return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }
      await db
        .update(accountsTable)
        .set({ passwordHash: hashPassword(String(password)) })
        .where(eq(accountsTable.showroomId, id));
    }

    const [accountRow] = await db.select().from(accountsTable).where(eq(accountsTable.showroomId, id));
    res.json(showroomResponse(updated, { username: accountRow?.username ?? null }));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/showrooms/:id — delete showroom, its account and its bikes
router.delete("/admin/showrooms/:id", requireAdminAccount, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db.select().from(showroomsTable).where(eq(showroomsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });

    await db.delete(bikesTable).where(eq(bikesTable.showroomId, id));
    await db.delete(showroomsTable).where(eq(showroomsTable.id, id));

    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------- Showroom: own listings management ----------------

// GET /api/showroom/bikes
router.get("/showroom/bikes", requireShowroomAccount, async (req: any, res: any) => {
  try {
    const account = (req as AccountRequest).account!;
    const bikes = await db
      .select()
      .from(bikesTable)
      .where(eq(bikesTable.showroomId, account.showroomId!))
      .orderBy(desc(bikesTable.createdAt));

    res.json(bikes.map((b) => buildBikeResponse(b)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/showroom/bikes
router.post("/showroom/bikes", requireShowroomAccount, async (req: any, res: any) => {
  try {
    const account = (req as AccountRequest).account!;
    const [showroom] = await db.select().from(showroomsTable).where(eq(showroomsTable.id, account.showroomId!));
    if (!showroom) return res.status(403).json({ error: "Forbidden" });

    const { title, description, price, priceOnRequest, category, condition, brand, phone, images, mileage, engineCapacity, province, hasDelivery, hasDocuments } = req.body;
    if (!title || (!price && !priceOnRequest) || !category || !condition || !phone || !province) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [bike] = await db
      .insert(bikesTable)
      .values({
        title,
        description,
        price: priceOnRequest ? null : price?.toString(),
        priceOnRequest: !!priceOnRequest,
        category,
        condition,
        brand,
        phone,
        images,
        mileage: mileage !== undefined && mileage !== null ? parseInt(mileage) : undefined,
        engineCapacity: engineCapacity !== undefined && engineCapacity !== null ? parseInt(engineCapacity) : undefined,
        province,
        hasDelivery: !!hasDelivery,
        hasDocuments: !!hasDocuments,
        status: "active",
        showroomId: showroom.id,
        userId: `showroom:${showroom.id}`,
        userName: showroom.name,
      })
      .returning();

    res.status(201).json(buildBikeResponse(bike, showroom));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/showroom/bikes/:id
router.put("/showroom/bikes/:id", requireShowroomAccount, async (req: any, res: any) => {
  try {
    const account = (req as AccountRequest).account!;
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db.select().from(bikesTable).where(eq(bikesTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.showroomId !== account.showroomId) return res.status(403).json({ error: "Forbidden" });

    const { title, description, price, priceOnRequest, category, condition, brand, phone, images, mileage, engineCapacity, province, hasDelivery, hasDocuments, status } = req.body;
    const [updated] = await db
      .update(bikesTable)
      .set({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priceOnRequest !== undefined && { priceOnRequest: !!priceOnRequest }),
        ...(priceOnRequest ? { price: null } : price !== undefined ? { price: price.toString() } : {}),
        ...(category && { category }),
        ...(condition && { condition }),
        ...(brand !== undefined && { brand }),
        ...(phone && { phone }),
        ...(images !== undefined && { images }),
        ...(mileage !== undefined && { mileage: mileage !== null ? parseInt(mileage) : null }),
        ...(engineCapacity !== undefined && { engineCapacity: engineCapacity !== null ? parseInt(engineCapacity) : null }),
        ...(province !== undefined && { province }),
        ...(hasDelivery !== undefined && { hasDelivery: !!hasDelivery }),
        ...(hasDocuments !== undefined && { hasDocuments: !!hasDocuments }),
        ...(status && ["active", "sold"].includes(status) && { status }),
        updatedAt: new Date(),
      })
      .where(eq(bikesTable.id, id))
      .returning();

    res.json(buildBikeResponse(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/showroom/bikes/:id
router.delete("/showroom/bikes/:id", requireShowroomAccount, async (req: any, res: any) => {
  try {
    const account = (req as AccountRequest).account!;
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db.select().from(bikesTable).where(eq(bikesTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.showroomId !== account.showroomId) return res.status(403).json({ error: "Forbidden" });

    await db.delete(bikesTable).where(eq(bikesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
