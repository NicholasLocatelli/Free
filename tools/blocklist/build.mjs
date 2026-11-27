#!/usr/bin/env node
/**
 * Builds the bundled gambling blocklist (D-030, docs/architecture/site-blocker.md).
 *
 * Downloads every source in sources.json, keeps valid domain names, removes the allowlist,
 * drops subdomains already covered by a listed parent (the matcher blocks subdomains too),
 * and writes a sorted, gzipped list plus a manifest with sources, licences, counts and
 * hashes. Run with `pnpm blocklist`; the result is committed and shipped with the app.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../../apps/mobile/blocklist");

const DOMAIN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{1,62}$/;
/** Lists must never block a whole public suffix: anything this short is rejected. */
const MIN_LABELS = 2;

const sha256 = (text) => createHash("sha256").update(text).digest("hex");

/** Accepts hosts-file lines ("0.0.0.0 example.com") and plain domain lines. */
export function parseDomains(text) {
  const domains = new Set();
  for (const raw of text.split("\n")) {
    const line = raw.split("#", 1)[0].trim().toLowerCase();
    if (!line) continue;
    const domain = line.split(/\s+/).at(-1).replace(/\.$/, "");
    if (DOMAIN.test(domain) && domain.split(".").length >= MIN_LABELS) domains.add(domain);
  }
  return domains;
}

export function parseAllowlist(text) {
  return text
    .split("\n")
    .map((l) => l.split("#", 1)[0].trim().toLowerCase())
    .filter(Boolean);
}

/** True when `domain` is `parent` or one of its subdomains. */
const within = (domain, parent) => domain === parent || domain.endsWith(`.${parent}`);

/** Removes allowlisted domains and subdomains already covered by a listed parent. */
export function compact(domains, allowlist) {
  const conflicts = [...domains].filter((d) => allowlist.some((a) => within(d, a) || within(a, d)));
  const kept = new Set();
  const byDepth = [...domains]
    .filter((d) => !conflicts.includes(d))
    .sort((a, b) => a.split(".").length - b.split(".").length || a.localeCompare(b));
  for (const domain of byDepth) {
    const labels = domain.split(".");
    const covered = labels.slice(1, -1).some((_, i) => kept.has(labels.slice(i + 1).join(".")));
    if (!covered) kept.add(domain);
  }
  return { domains: [...kept].sort(), conflicts: conflicts.sort() };
}

async function main() {
  const sources = JSON.parse(readFileSync(join(here, "sources.json"), "utf8"));
  const allowlist = parseAllowlist(readFileSync(join(here, "allowlist.txt"), "utf8"));
  const all = new Set();
  const manifestSources = [];
  for (const source of sources) {
    const response = await fetch(source.url);
    if (!response.ok) throw new Error(`${source.id}: HTTP ${response.status}`);
    const text = await response.text();
    const domains = parseDomains(text);
    for (const d of domains) all.add(d);
    manifestSources.push({ ...source, sha256: sha256(text), domains: domains.size });
    console.log(`${source.id}: ${domains.size} domains`);
  }
  const { domains, conflicts } = compact(all, allowlist);
  if (conflicts.length > 0) {
    console.log(`Removed because allowlisted: ${conflicts.join(", ")}`);
  }
  const list = `${domains.join("\n")}\n`;
  writeFileSync(join(outDir, "gambling.txt.gz"), gzipSync(list, { level: 9, mtime: 0 }));
  const manifest = {
    builtAt: new Date().toISOString(),
    domains: domains.length,
    sha256: sha256(list),
    removedByAllowlist: conflicts,
    sources: manifestSources,
  };
  writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${domains.length} domains.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
