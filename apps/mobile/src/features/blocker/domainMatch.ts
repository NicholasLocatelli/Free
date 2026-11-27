/**
 * Which hosts the site blocker stops (D-030). The list holds registrable domains and
 * subdomains; a host is blocked when it or any of its parent domains is listed. The
 * Android VPN and the iOS Safari rules must follow the same rules: the shared cases are
 * in matchVectors.json.
 */

/** A host as seen in a DNS query or a URL: lower case, no trailing dot, port or brackets. */
export function normalizeHost(raw: string): string | null {
  let host = raw.trim().toLowerCase();
  if (host.startsWith("[")) return null; // IPv6 literal: not a domain name
  host = host.replace(/:\d+$/, "").replace(/\.$/, "");
  if (host === "" || /^[\d.]+$/.test(host)) return null; // IPv4 literal
  return /^[a-z0-9.-]+$/.test(host) && !host.includes("..") ? host : null;
}

/** True when the host or one of its parent domains (at least two labels) is listed. */
export function isBlocked(raw: string, blocked: ReadonlySet<string>): boolean {
  const host = normalizeHost(raw);
  if (host === null) return false;
  const labels = host.split(".");
  for (let i = 0; i <= labels.length - 2; i++) {
    if (blocked.has(labels.slice(i).join("."))) return true;
  }
  return false;
}
