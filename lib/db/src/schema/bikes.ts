import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bikesTable = pgTable("bikes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  condition: text("condition").notNull(),
  brand: text("brand"),
  phone: text("phone").notNull(),
  images: text("images").array(),
  mileage: integer("mileage"),
  status: text("status").notNull().default("active"),
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
