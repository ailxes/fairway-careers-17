#!/usr/bin/env node
/**
 * Run SQL against a Supabase project via the Management API (no DB password).
 * Auth: SUPABASE_ACCESS_TOKEN (a personal access token) from .env.local.
 *
 *   node scripts/db.mjs <file.sql> [projectRef]
 *   node scripts/db.mjs --query "select 1" [projectRef]
 *
 * projectRef defaults to SUPABASE_NEW_PROJECT_REF in .env.local.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./ingest/lib.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = loadEnv(root);
const TOKEN = env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) throw new Error("SUPABASE_ACCESS_TOKEN missing in .env.local");

const args = process.argv.slice(2);
let query, refArg;
if (args[0] === "--query") {
  query = args[1];
  refArg = args[2];
} else {
  query = readFileSync(resolve(args[0]), "utf8");
  refArg = args[1];
}
const ref = refArg || env.SUPABASE_NEW_PROJECT_REF;
if (!ref) throw new Error("No project ref (arg or SUPABASE_NEW_PROJECT_REF)");

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});
const text = await res.text();
if (!res.ok) {
  console.error(`SQL failed (${res.status}):`, text.slice(0, 1000));
  process.exit(1);
}
try {
  const j = JSON.parse(text);
  console.log(Array.isArray(j) ? `OK — ${j.length} row(s)` : "OK");
  if (Array.isArray(j) && j.length && j.length <= 60) console.log(JSON.stringify(j, null, 2).slice(0, 4000));
} catch {
  console.log("OK");
}
