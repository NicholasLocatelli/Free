import { newJourney, T0 } from "../../test/fixtures";
import { backupFileName, MAX_BACKUP_BYTES, parseBackup, serializeBackup } from "./backupFormat";

const content = { journey: newJourney(), settings: { theme: "dark", reminders: "{}" } };

describe("backup format", () => {
  it("round-trips journey and portable settings", () => {
    expect(parseBackup(serializeBackup(content, T0))).toEqual({ ok: true, value: content });
  });

  it("drops settings that are not portable", () => {
    const text = serializeBackup({ ...content, settings: { theme: "dark", onboarding: "x" } }, T0);
    expect(parseBackup(text)).toMatchObject({ ok: true, value: { settings: { theme: "dark" } } });
  });

  it.each([
    ["not_json", "{nope"],
    ["wrong_format", JSON.stringify({ hello: "world" })],
    ["wrong_format", JSON.stringify({ format: "other-app", version: 1 })],
    ["unsupported_version", JSON.stringify({ format: "approdo-backup", version: 2 })],
    ["invalid_data", JSON.stringify({ format: "approdo-backup", version: 1, journey: { id: 1 } })],
    ["too_large", " ".repeat(MAX_BACKUP_BYTES + 1)],
  ])("reports %s", (error, text) => {
    expect(parseBackup(text)).toEqual({ ok: false, error });
  });

  it("names files by date without personal data", () => {
    expect(backupFileName(T0)).toBe("approdo-backup-2026-10-01.json");
  });
});
