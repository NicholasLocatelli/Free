import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { compact, parseAllowlist, parseDomains } from "./build.mjs";

const here = dirname(fileURLToPath(import.meta.url));

test("parses hosts files and plain lists, skipping comments and invalid names", () => {
  const text = [
    "# comment",
    "0.0.0.0 Casino.Example.COM",
    "127.0.0.1 bet.example.net # trailing comment",
    "plain-bets.org.",
    "0.0.0.0 localhost",
    "0.0.0.0 not a domain",
    "0.0.0.0 com",
  ].join("\n");
  assert.deepEqual([...parseDomains(text)].sort(), [
    "bet.example.net",
    "casino.example.com",
    "plain-bets.org",
  ]);
});

test("drops subdomains covered by a listed parent and anything allowlisted", () => {
  const domains = new Set(["bet.com", "www.bet.com", "x.y.bet.com", "casino.org", "iss.it"]);
  const result = compact(domains, ["iss.it"]);
  assert.deepEqual(result.domains, ["bet.com", "casino.org"]);
  assert.deepEqual(result.conflicts, ["iss.it"]);
});

test("an allowlisted subdomain also protects its listed parent", () => {
  const result = compact(new Set(["iss.it"]), ["usciredalgioco.iss.it"]);
  assert.deepEqual(result.domains, []);
});

test("the committed list never contains an allowlisted domain or one of its parents", () => {
  const allowlist = parseAllowlist(readFileSync(join(here, "allowlist.txt"), "utf8"));
  const list = gunzipSync(
    readFileSync(join(here, "../../apps/mobile/blocklist/gambling.txt.gz")),
  ).toString("utf8");
  const domains = new Set(list.trim().split("\n"));
  for (const allowed of allowlist) {
    const labels = allowed.split(".");
    for (let i = 0; i < labels.length - 1; i++) {
      assert.ok(!domains.has(labels.slice(i).join(".")), `${allowed} would be blocked`);
    }
  }
  const manifest = JSON.parse(
    readFileSync(join(here, "../../apps/mobile/blocklist/manifest.json"), "utf8"),
  );
  assert.equal(manifest.domains, domains.size);
});
