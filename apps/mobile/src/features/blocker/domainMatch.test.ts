/**
 * @jest-environment node
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { isBlocked, normalizeHost } from "./domainMatch";
import vectors from "./matchVectors.json";

describe("isBlocked (shared vectors, also used by the native filters)", () => {
  const listed = new Set(vectors.listed);
  it.each(vectors.cases.map((c) => [c.host, c.blocked] as const))("%s → %s", (host, blocked) => {
    expect(isBlocked(host, listed)).toBe(blocked);
  });
});

describe("normalizeHost", () => {
  it("keeps only plain domain names", () => {
    expect(normalizeHost(" WWW.Example.COM.:8080 ")).toBe("www.example.com");
    expect(normalizeHost("10.0.0.1")).toBeNull();
    expect(normalizeHost("exa mple.com")).toBeNull();
  });
});

describe("the bundled list", () => {
  const list = new Set(
    gunzipSync(readFileSync(join(__dirname, "../../../blocklist/gambling.txt.gz")))
      .toString("utf8")
      .trim()
      .split("\n"),
  );

  it.each(["www.snai.it", "sisal.it", "www.lottomatica.it", "eurobet.it", "www.bet365.it"])(
    "blocks the Italian operator %s",
    (host) => {
      expect(isBlocked(host, list)).toBe(true);
    },
  );

  it.each([
    "usciredalgioco.iss.it",
    "www.adm.gov.it",
    "lnx.giocatorianonimi.org",
    "www.telefonoamico.it",
    "betblocker.org",
    "www.gamblersanonymous.org",
    "www.google.com",
  ])("never blocks %s", (host) => {
    expect(isBlocked(host, list)).toBe(false);
  });
});
