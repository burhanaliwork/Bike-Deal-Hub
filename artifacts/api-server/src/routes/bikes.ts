import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { bikesTable, favoritesTable, usersTable, showroomsTable } from "@workspace/db";
import { eq, and, ilike, gte, lte, desc, sql } from "drizzle-orm";
import { requireAdminAccount } from "../lib/accountAuth";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId;
  next();
};

const requireAdmin = requireAdminAccount;

async function upsertUser(userId: string, userName?: string, userEmail?: string) {
  try {
    await db
      .insert(usersTable)
      .values({ id: userId, email: userEmail || "", name: userName })
      .onConflictDoUpdate({
        target: usersTable.id,
        set: { name: userName, email: userEmail || "" },
      });
  } catch {}
}

function buildBikeResponse(bike: any, isFavorited: boolean = false, showroom: any = null) {
  return {
    ...bike,
    price: parseFloat(bike.price),
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
    const auth = getAuth(req);
    const userId = auth?.userId;
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

    let favoriteIds = new Set<number>();
    if (userId) {
      const favs = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId));
      favoriteIds = new Set(favs.map((f) => f.bikeId));
    }

    res.json(rows.map((r) => buildBikeResponse(r.bike, favoriteIds.has(r.bike.id), r.showroom)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/bikes - create a new listing
router.post("/bikes", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const userId = req.userId;
    const userName = (auth?.sessionClaims as any)?.fullName || (auth?.sessionClaims as any)?.firstName || undefined;
    const userEmail = (auth?.sessionClaims?.email as string) || undefined;

    await upsertUser(userId, userName, userEmail);

    const { title, description, price, category, condition, brand, phone, images, mileage, engineCapacity, province, hasDelivery, hasDocuments } = req.body;
    if (!title || !price || !category || !condition || !phone || !province) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [bike] = await db
      .insert(bikesTable)
      .values({
        title,
        description,
        price: price.toString(),
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
        userId,
        userName,
        userEmail,
      })
      .returning();

    res.status(201).json(buildBikeResponse(bike));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
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

// GET /api/bikes/my - current user's listings
router.get("/bikes/my", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const bikes = await db
      .select()
      .from(bikesTable)
      .where(eq(bikesTable.userId, userId))
      .orderBy(desc(bikesTable.createdAt));

    res.json(bikes.map((b) => buildBikeResponse(b)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/bikes/:id
router.get("/bikes/:id", async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [row] = await db
      .select({ bike: bikesTable, showroom: showroomsTable })
      .from(bikesTable)
      .leftJoin(showroomsTable, eq(bikesTable.showroomId, showroomsTable.id))
      .where(eq(bikesTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });

    let isFavorited = false;
    if (userId) {
      const [fav] = await db
        .select()
        .from(favoritesTable)
        .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.bikeId, id)));
      isFavorited = !!fav;
    }

    res.json(buildBikeResponse(row.bike, isFavorited, row.showroom));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/bikes/:id
router.put("/bikes/:id", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db.select().from(bikesTable).where(eq(bikesTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.userId !== userId) return res.status(403).json({ error: "Forbidden" });

    const { title, description, price, category, condition, brand, phone, images, mileage, engineCapacity, province, hasDelivery, hasDocuments } = req.body;
    const [updated] = await db
      .update(bikesTable)
      .set({
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: price.toString() }),
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

// DELETE /api/bikes/:id
router.delete("/bikes/:id", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db.select().from(bikesTable).where(eq(bikesTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });

    const auth = getAuth(req);
    const role = (auth?.sessionClaims?.publicMetadata as any)?.role;
    if (existing.userId !== userId && role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    await db.delete(bikesTable).where(eq(bikesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/favorites
router.get("/favorites", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const favs = await db
      .select({ bike: bikesTable })
      .from(favoritesTable)
      .innerJoin(bikesTable, eq(favoritesTable.bikeId, bikesTable.id))
      .where(eq(favoritesTable.userId, userId))
      .orderBy(desc(favoritesTable.createdAt));

    res.json(favs.map((f) => buildBikeResponse(f.bike, true)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/favorites/:bikeId
router.post("/favorites/:bikeId", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const bikeId = parseInt(req.params.bikeId);
    if (isNaN(bikeId)) return res.status(400).json({ error: "Invalid bikeId" });

    await db
      .insert(favoritesTable)
      .values({ userId, bikeId })
      .onConflictDoNothing();

    res.status(201).json({ success: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/favorites/:bikeId
router.delete("/favorites/:bikeId", requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const bikeId = parseInt(req.params.bikeId);
    if (isNaN(bikeId)) return res.status(400).json({ error: "Invalid bikeId" });

    await db
      .delete(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.bikeId, bikeId)));

    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

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

    const [newUsersRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(gte(usersTable.createdAt, startOfMonth));

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
      newUsersThisMonth: newUsersRow.count,
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
