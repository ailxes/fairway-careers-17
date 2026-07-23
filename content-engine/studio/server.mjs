#!/usr/bin/env node
// TeeUpJobs Studio — local review UI for content drafts.
// No dependencies. Serves the UI, the drafts (for overlay preview), and a
// small JSON API for editing, spine upload, assemble, and status changes.
//   node content-engine/studio/server.mjs   → http://localhost:4790
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, mkdirSync, createWriteStream } from "node:fs";
import { resolve, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const engine = resolve(here, "..");
const draftsDir = resolve(engine, "drafts");
const PORT = Number(process.env.PORT ?? 4790);

const MIME = { ".html": "text/html", ".json": "application/json", ".md": "text/plain", ".txt": "text/plain", ".mp4": "video/mp4", ".css": "text/css", ".js": "text/javascript" };
const EDITABLE = new Set(["script.md", "caption.txt"]);

const send = (res, code, body, type = "application/json") => {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
};
const readBody = (req) =>
  new Promise((ok) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => ok(Buffer.concat(chunks)));
  });
const safeSlug = (s) => /^[a-z0-9-]+$/.test(s ?? "");

const run = (script, args) =>
  new Promise((ok) => {
    execFile("node", [resolve(engine, script), ...args], { cwd: resolve(engine, ".."), timeout: 600000 }, (err, stdout, stderr) =>
      ok({ ok: !err, out: `${stdout}\n${stderr}`.trim() }),
    );
  });

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;

  try {
    if (p === "/" || p === "/index.html") return send(res, 200, readFileSync(resolve(here, "index.html"), "utf8"), "text/html");

    if (p === "/api/drafts") {
      const drafts = readdirSync(draftsDir)
        .filter((d) => existsSync(resolve(draftsDir, d, "meta.json")) || existsSync(resolve(draftsDir, d, "script.md")))
        .map((slugName) => {
          let meta = {};
          try { meta = JSON.parse(readFileSync(resolve(draftsDir, slugName, "meta.json"), "utf8")); } catch {}
          return {
            slug: slugName,
            meta,
            hasSpine: existsSync(resolve(draftsDir, slugName, "overlay/assets/spine.mp4")),
            mtime: statSync(resolve(draftsDir, slugName)).mtimeMs,
          };
        })
        .sort((a, b) => b.slug.localeCompare(a.slug));
      return send(res, 200, drafts);
    }

    const m = p.match(/^\/api\/draft\/([^/]+)\/(file|spine|assemble|status)$/);
    if (m) {
      const [, slugName, action] = m;
      if (!safeSlug(slugName)) return send(res, 400, { error: "bad slug" });
      const dir = resolve(draftsDir, slugName);
      if (!existsSync(dir)) return send(res, 404, { error: "no such draft" });

      if (action === "file" && req.method === "GET") {
        const name = url.searchParams.get("name");
        if (!/^[a-z._-]+$/i.test(name ?? "") || name.includes("..")) return send(res, 400, { error: "bad name" });
        const f = resolve(dir, name);
        if (!existsSync(f)) return send(res, 404, { error: "not found" });
        return send(res, 200, readFileSync(f, "utf8"), "text/plain");
      }
      if (action === "file" && req.method === "PUT") {
        const { name, content } = JSON.parse(String(await readBody(req)));
        if (!EDITABLE.has(name)) return send(res, 400, { error: "not editable" });
        writeFileSync(resolve(dir, name), content);
        return send(res, 200, { ok: true });
      }
      if (action === "spine" && req.method === "POST") {
        mkdirSync(resolve(dir, "overlay/assets"), { recursive: true });
        const buf = await readBody(req);
        writeFileSync(resolve(dir, "overlay/assets/spine.mp4"), buf);
        return send(res, 200, { ok: true, bytes: buf.length });
      }
      if (action === "assemble" && req.method === "POST") {
        const result = await run("assemble.mjs", [slugName]);
        return send(res, result.ok ? 200 : 500, result);
      }
      if (action === "status" && req.method === "POST") {
        const { status } = JSON.parse(String(await readBody(req)));
        const metaPath = resolve(dir, "meta.json");
        const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, "utf8")) : { slug: slugName };
        meta.status = status;
        writeFileSync(metaPath, JSON.stringify(meta, null, 2));
        return send(res, 200, { ok: true });
      }
    }

    if (p === "/api/generate" && req.method === "POST") {
      const { topic } = JSON.parse(String(await readBody(req)));
      if (!/^[a-z-]+$/.test(topic ?? "")) return send(res, 400, { error: "bad topic" });
      const result = await run("generate.mjs", [topic]);
      return send(res, result.ok ? 200 : 500, result);
    }

    // Static: serve drafts for the overlay preview iframe.
    if (p.startsWith("/drafts/")) {
      const rel = normalize(decodeURIComponent(p.slice("/drafts/".length)));
      if (rel.includes("..")) return send(res, 400, { error: "bad path" });
      const f = resolve(draftsDir, rel);
      if (!existsSync(f) || !statSync(f).isFile()) return send(res, 404, { error: "not found" });
      res.writeHead(200, { "Content-Type": MIME[extname(f)] ?? "application/octet-stream" });
      return res.end(readFileSync(f));
    }

    send(res, 404, { error: "not found" });
  } catch (e) {
    send(res, 500, { error: String(e.message ?? e) });
  }
}).listen(PORT, () => console.log(`TeeUpJobs Studio → http://localhost:${PORT}`));
