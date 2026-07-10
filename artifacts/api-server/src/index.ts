import app from "./app";
import { logger } from "./lib/logger";
import path from "path";
import express from "express";

const rawPort = process.env["PORT"] || "10000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Serve static frontend files in production
// Frontend builds to artifacts/bike-market/dist/public
const staticDir = path.resolve(
  import.meta.dirname,
  "../../bike-market/dist/public"
);
app.use(express.static(staticDir, { maxAge: "1d" }));

// SPA fallback — must be last, after all API routes
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "Server listening");
});
