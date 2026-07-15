import app from "./app";
import { logger } from "./lib/logger";
import path from "path";
import express from "express";
import { pool } from "@workspace/db";
import { hashPassword } from "./lib/accountAuth";

const rawPort = process.env["PORT"] || "10000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function runMigrations() {
  const client = await pool.connect();
  try {
    // 1. Create all tables from scratch (idempotent)
    await client.query(`
      CREATE TABLE IF NOT EXISTS showrooms (
        id            SERIAL PRIMARY KEY,
        name          TEXT NOT NULL,
        image_url     TEXT,
        google_maps_url TEXT,
        phone         TEXT,
        verified      BOOLEAN NOT NULL DEFAULT true,
        created_at    TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id            SERIAL PRIMARY KEY,
        username      TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role          TEXT NOT NULL,
        showroom_id   INTEGER REFERENCES showrooms(id) ON DELETE CASCADE,
        created_at    TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS users (
        id         TEXT PRIMARY KEY,
        email      TEXT NOT NULL,
        name       TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS bikes (
        id              SERIAL PRIMARY KEY,
        title           TEXT NOT NULL,
        description     TEXT,
        price           NUMERIC(10,2),
        price_on_request BOOLEAN NOT NULL DEFAULT false,
        category        TEXT,
        condition       TEXT,
        brand           TEXT,
        phone           TEXT NOT NULL DEFAULT '',
        images          TEXT[],
        mileage         INTEGER,
        engine_capacity INTEGER,
        province        TEXT,
        has_delivery    BOOLEAN NOT NULL DEFAULT false,
        has_documents   BOOLEAN NOT NULL DEFAULT false,
        status          TEXT NOT NULL DEFAULT 'active',
        showroom_id     INTEGER REFERENCES showrooms(id) ON DELETE SET NULL,
        user_id         TEXT,
        user_name       TEXT,
        user_email      TEXT,
        created_at      TIMESTAMP NOT NULL DEFAULT now(),
        updated_at      TIMESTAMP NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id         SERIAL PRIMARY KEY,
        user_id    TEXT NOT NULL,
        bike_id    INTEGER NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // 2. Add any columns that might be missing from older schema versions
    const alterStatements = [
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS category text`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS condition text`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS brand text`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS province text`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS images text[]`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS mileage integer`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS engine_capacity integer`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS has_delivery boolean NOT NULL DEFAULT false`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS has_documents boolean NOT NULL DEFAULT false`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS price_on_request boolean NOT NULL DEFAULT false`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS showroom_id integer`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS user_id text`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS user_name text`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS user_email text`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS created_at timestamp NOT NULL DEFAULT now()`,
      `ALTER TABLE bikes ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT now()`,
      `ALTER TABLE showrooms ADD COLUMN IF NOT EXISTS google_maps_url text`,
      `ALTER TABLE showrooms ADD COLUMN IF NOT EXISTS phone text`,
      `ALTER TABLE showrooms ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT true`,
    ];
    for (const stmt of alterStatements) {
      await client.query(stmt).catch(() => {});
    }

    // 3. Drop NOT NULL on columns that should be nullable
    await client.query(`ALTER TABLE bikes ALTER COLUMN user_id DROP NOT NULL`).catch(() => {});
    await client.query(`ALTER TABLE bikes ALTER COLUMN category DROP NOT NULL`).catch(() => {});
    await client.query(`ALTER TABLE bikes ALTER COLUMN condition DROP NOT NULL`).catch(() => {});
    await client.query(`ALTER TABLE bikes ALTER COLUMN phone DROP NOT NULL`).catch(() => {});

    // 4. Seed admin account if it doesn't exist
    const adminPassword = process.env["ADMIN_PASSWORD"] ?? "MB-z40tDIwU";
    const adminHash = hashPassword(adminPassword);
    await client.query(
      `INSERT INTO accounts (username, password_hash, role)
       VALUES ($1, $2, 'admin')
       ON CONFLICT (username) DO NOTHING`,
      ["admin", adminHash]
    );

    logger.info("DB migrations applied successfully");
  } catch (err: any) {
    console.error("MIGRATION_ERROR:", err?.message, err?.stack);
  } finally {
    client.release();
  }
}

// Serve static frontend files in production
const staticDir = path.resolve(
  import.meta.dirname,
  "../../bike-market/dist/public"
);
app.use(express.static(staticDir, { maxAge: "1d" }));

// SPA fallback — must be last, after all API routes
app.use((req: any, res: any, next: any) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(port, "0.0.0.0", async () => {
  logger.info({ port }, "Server listening");
  await runMigrations();
});
