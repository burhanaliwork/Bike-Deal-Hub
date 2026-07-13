import { Router } from "express";
import { db } from "@workspace/db";
import { bikesTable, favoritesTable, usersTable, showroomsTable } from "@workspace/db";
import { eq, and, ilike, gte, lte, desc, sql } from "drizzle-orm";
import { requireAdminAccount } from "../lib/accountAuth";

const router = Router();

const requireAdmin = requireAdminAccount;

function buildBikeResponse(bike: any, isFavorited: boolean = false, showroom: any = null) {
  return {
    ...bike,
    price: bike.price != null ? parseFloat(bike.price) : null,
    isFavorited,
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

// GET /api/bikes - list all active bikes
router.get("/bikes", async (req: any, res: any) => {
  try {
    const { category, condition, minPrice, maxPrice, minMileage, maxMileage, province, hasDelivery, hasDocuments, showroomId, search, status } = req.query;

    const conditions: any[] = [];
    if (status) {
      conditions.push(eq(bikesTable.status, status as string));
    } else {
      conditions.push(eq(bikesTable.status, "active"));
    }
    if (category) conditions.push(eq(bikesTable.category, category as string));
    if (condition) conditions.push(eq(bikesTable.condition, condition as string));
    if (minPrice) conditions.push(gte(bikesTable.price, minPrice as string));
    if (maxPrice) conditions.push(lte(bikesTable.price, maxPrice as string));
    if (minMileage) conditions.push(gte(bikesTable.mileage, parseInt(minMileage as string)));
    if (maxMileage) conditions.push(lte(bikesTable.mileage, parseInt(maxMileage as string)));
    if (province) conditions.push(eq(bikesTable.province, province as string));
    if (hasDelivery !== undefined) conditions.push(eq(bikesTable.hasDelivery, hasDelivery === "true"));
    if (hasDocuments !== undefined) conditions.push(eq(bikesTable.hasDocuments, hasDocuments === "true"));
    if (showroomId) conditions.push(eq(bikesTable.showroomId, parseInt(showroomId as string)));
    if (search) conditions.push(ilike(bikesTable.title, `%${search}%`));

    const rows = await db
      .select({ bike: bikesTable, showroom: showroomsTable })
      .from(bikesTable)
      .leftJoin(showroomsTable, eq(bikesTable.showroomId, showroomsTable.id))
      .where(and(...conditions))
      .orderBy(desc(bikesTable.createdAt));

    res.json(rows.map((r) => buildBikeResponse(r.bike, false, r.showroom)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/bikes - create a new listing (no auth required)
router.post("/bikes", async (req: any, res: any) => {
  try {
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
        userId: `anon:${phone}`,
      })
      .returning();

    res.status(201).json(buildBikeResponse(bike));
  } catch (err: any) {
    req.log.error({ err, detail: err?.message }, "Failed to create bike listing");
    res.status(500).json({ error: "Internal server error", detail: err?.message ?? String(err) });
  }
});

// GET /api/bikes/stats - marketplace stats
router.get("/bikes/stats", async (req: any, res: any) => {
  try {
    const [totalRow] = await db.select({ count: sql<number>`count(*)::int` }).from(bikesTable);
    const [activeRow] = await db.select({ count: sql<number>`count(*)::int` }).from(bikesTable).where(eq(bikesTable.status, "active"));
    const [soldRow] = await db.select({ count: sql<number>`count(*)::int` }).from(bikesTable).where(eq(bikesTable.status, "sold"));

    const categoryRows = await db
      .select({ category: bikesTable.category, count: sql<number>`count(*)::int` })
      .from(bikesTable)
      .where(eq(bikesTable.status, "active"))
      .groupBy(bikesTable.category);

    const recentListings = await db
      .select()
      .from(bikesTable)
      .where(eq(bikesTable.status, "active"))
      .orderBy(desc(bikesTable.createdAt))
      .limit(6);

    res.json({
      totalListings: totalRow.count,
      activeListings: activeRow.count,
      soldListings: soldRow.count,
      categoryBreakdown: categoryRows,
      recentListings: recentListings.map((b) => buildBikeResponse(b)),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/bikes/my - not supported for anonymous users
router.get("/bikes/my", async (req: any, res: any) => {
  res.json([]);
});

// GET /api/bikes/:id
router.get("/bikes/:id", async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [row] = await db
      .select({ bike: bikesTable, showroom: showroomsTable })
      .from(bikesTable)
      .leftJoin(showroomsTable, eq(bikesTable.showroomId, showroomsTable.id))
      .where(eq(bikesTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });

    res.json(buildBikeResponse(row.bike, false, row.showroom));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/bikes/:id (update by owner via userId, kept for compatibility)
router.put("/bikes/:id", async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db.select().from(bikesTable).where(eq(bikesTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });

    const { title, description, price, priceOnRequest, category, condition, brand, phone, images, mileage, engineCapacity, province, hasDelivery, hasDocuments } = req.body;
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

// DELETE /api/bikes/:id (admin or showroom ownership enforced elsewhere)
router.delete("/bikes/:id", async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db.select().from(bikesTable).where(eq(bikesTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });

    await db.delete(bikesTable).where(eq(bikesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Favorites — stubs (no public auth)
router.get("/favorites", async (req: any, res: any) => res.json([]));
router.post("/favorites/:bikeId", async (req: any, res: any) => res.status(401).json({ error: "Login required" }));
router.delete("/favorites/:bikeId", async (req: any, res: any) => res.status(401).json({ error: "Login required" }));

// GET /api/admin/stats
router.get("/admin/stats", requireAdmin, async (req: any, res: any) => {
  try {
    const [totalUsersRow] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
    const [totalBikesRow] = await db.select({ count: sql<number>`count(*)::int` }).from(bikesTable);
    const [activeRow] = await db.select({ count: sql<number>`count(*)::int` }).from(bikesTable).where(eq(bikesTable.status, "active"));
    const [pendingRow] = await db.select({ count: sql<number>`count(*)::int` }).from(bikesTable).where(eq(bikesTable.status, "pending"));
    const [soldRow] = await db.select({ count: sql<number>`count(*)::int` }).from(bikesTable).where(eq(bikesTable.status, "sold"));
    const [rejectedRow] = await db.select({ count: sql<number>`count(*)::int` }).from(bikesTable).where(eq(bikesTable.status, "rejected"));

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [newBikesRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bikesTable)
      .where(gte(bikesTable.createdAt, startOfMonth));

    res.json({
      totalUsers: totalUsersRow.count,
      totalBikes: totalBikesRow.count,
      activeBikes: activeRow.count,
      pendingBikes: pendingRow.count,
      soldBikes: soldRow.count,
      rejectedBikes: rejectedRow.count,
      newUsersThisMonth: 0,
      newBikesThisMonth: newBikesRow.count,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/bikes
router.get("/admin/bikes", requireAdmin, async (req: any, res: any) => {
  try {
    const bikes = await db.select().from(bikesTable).orderBy(desc(bikesTable.createdAt));
    res.json(bikes.map((b) => buildBikeResponse(b)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/bikes/:id/status
router.put("/admin/bikes/:id/status", requireAdmin, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Missing status" });

    const [updated] = await db
      .update(bikesTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(bikesTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(buildBikeResponse(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users
router.get("/admin/users", requireAdmin, async (req: any, res: any) => {
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));

    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const [row] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(bikesTable)
          .where(eq(bikesTable.userId, u.id));
        return { ...u, listingsCount: row.count };
      }),
    );

    res.json(usersWithCounts);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
