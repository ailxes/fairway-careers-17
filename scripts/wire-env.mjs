#!/usr/bin/env node
/**
 * Point the app at the new Supabase project and stash the service-role key
 * for the harvester. Fetches keys via the Management API so nothing is typed
 * or printed. One-off cutover helper.
 */
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./ingest/lib.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = loadEnv(root);
const TOKEN = env.SUPABASE_ACCESS_TOKEN;
const REF = env.SUPABASE_NEW_PROJECT_REF;
const URL = `https://${REF}.supabase.co`;

const keys = await (await fetch(`https://api.supabase.com/v1/projects/${REF}/api-keys?reveal=true`, {
  headers: { Authorization: `Bearer ${TOKEN}` },
})).json();

// Prefer new-style keys; fall back to legacy JWTs.
const publishable =
  keys.find((k) => (k.api_key ?? "").startsWith("sb_publishable"))?.api_key ??
  keys.find((k) => k.name === "anon")?.api_key;
const serviceRole =
  keys.find((k) => k.name === "service_role")?.api_key ??
  keys.find((k) => (k.api_key ?? "").startsWith("sb_secret"))?.api_key;
if (!publishable || !serviceRole) throw new Error("Could not resolve keys from API response");

// Rewrite .env values in place (keeps var names the app already reads).
let dotenv = readFileSync(resolve(root, ".env"), "utf8");
const set = (k, v) => {
  const re = new RegExp(`^${k}=.*$`, "m");
  dotenv = re.test(dotenv) ? dotenv.replace(re, `${k}="${v}"`) : dotenv + `\n${k}="${v}"`;
};
set("SUPABASE_URL", URL);
set("VITE_SUPABASE_URL", URL);
set("SUPABASE_PUBLISHABLE_KEY", publishable);
set("VITE_SUPABASE_PUBLISHABLE_KEY", publishable);
set("SUPABASE_PROJECT_ID", REF);
set("VITE_SUPABASE_PROJECT_ID", REF);
writeFileSync(resolve(root, ".env"), dotenv);

// Service-role key → .env.local only (gitignored), for harvest.mjs.
let local = readFileSync(resolve(root, ".env.local"), "utf8");
if (!/^SUPABASE_SERVICE_ROLE_KEY=/m.test(local)) {
  appendFileSync(resolve(root, ".env.local"), `SUPABASE_SERVICE_ROLE_KEY=${serviceRole}\n`);
}

console.log("Wired. URL:", URL);
console.log("publishable key style:", publishable.startsWith("sb_") ? "sb_publishable" : "legacy anon JWT");
console.log("service_role style:", serviceRole.startsWith("sb_") ? "sb_secret" : "legacy JWT");
