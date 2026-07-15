import app from "./app";
import { logger } from "./lib/logger";
import path from "path";
import express from "express";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"] || "10000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS category text;
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS condition text;
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS brand text;
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS province text;
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS images text[];
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS mileage integer;
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS engine_capacity integer;
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS has_delivery boolean NOT NULL DEFAULT false;
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS has_documents boolean NOT NULL DEFAULT false;
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS price_on_request boolean NOT NULL DEFAULT false;
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS showroom_id integer;
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS user_id text;
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS user_name text;
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS user_email text;
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS created_at timestamp NOT NULL DEFAULT now();
      ALTER TABLE bikes ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT now();
    `);
    await client.query(`ALTER TABLE bikes ALTER COLUMN user_id DROP NOT NULL`).catch(() => {});
    await client.query(`ALTER TABLE bikes ALTER COLUMN category DROP NOT NULL`).catch(() => {});
    await client.query(`ALTER TABLE bikes ALTER COLUMN condition DROP NOT NULL`).catch(() => {});
    logger.info("DB migrations applied successfully");
  } catch (err: any) {
    console.error("MIGRATION_ERROR:", err?.message);
  } finally {
    client.release();
  }
}

// Serve static frontend files in production
// Frontend builds to artifacts/bike-market/dist/public
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
