import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const showroomsTable = pgTable("showrooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  googleMapsUrl: text("google_maps_url"),
  phone: text("phone"),
  verified: boolean("verified").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accountsTable = pgTable("accounts", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(), // 'admin' | 'showroom'
  showroomId: integer("showroom_id").references(() => showroomsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bikesTable = pgTable("bikes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }),
  priceOnRequest: boolean("price_on_request").notNull().default(false),
  category: text("category").notNull(),
  condition: text("condition").notNull(),
  brand: text("brand"),
  phone: text("phone").notNull(),
  images: text("images").array(),
  mileage: integer("mileage"),
  engineCapacity: integer("engine_capacity"),
  province: text("province"),
  hasDelivery: boolean("has_delivery").notNull().default(false),
  hasDocuments: boolean("has_documents").notNull().default(false),
  status: text("status").notNull().default("active"),
  showroomId: integer("showroom_id").references(() => showroomsTable.id, { onDelete: "set null" }),
  userId: text("user_id").notNull(),
  userName: text("user_name"),
  userEmail: text("user_email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  bikeId: integer("bike_id").notNull().references(() => bikesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBikeSchema = createInsertSchema(bikesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBike = z.infer<typeof insertBikeSchema>;
export type Bike = typeof bikesTable.$inferSelect;
export type Favorite = typeof favoritesTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
export type Showroom = typeof showroomsTable.$inferSelect;
export type Account = typeof accountsTable.$inferSelect;
