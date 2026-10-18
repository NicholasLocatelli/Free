import { err, ok, parseJourney, type Instant, type Journey, type Result } from "@free/core";
import { THEME_SETTINGS_KEY } from "../settings/SettingsScreen";
import { REMINDER_SETTINGS_KEY } from "../reminders/reminderPlan";

/**
 * Plain-JSON backup the user saves and moves between phones themselves (no account, no
 * server). The file is NOT encrypted: the UI says so before exporting.
 */
export const BACKUP_FORMAT = "approdo-backup";
export const BACKUP_VERSION = 1;
/** Preferences that travel with the data; onboarding drafts and lock state do not. */
export const PORTABLE_SETTINGS = [THEME_SETTINGS_KEY, REMINDER_SETTINGS_KEY] as const;
/** Generous upper bound (years of daily use is well under 1 MB). */
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

export interface BackupContent {
  journey: Journey;
  settings: Record<string, string>;
}

export type BackupError =
  "too_large" | "not_json" | "wrong_format" | "unsupported_version" | "invalid_data";

export function serializeBackup(content: BackupContent, exportedAt: Instant): string {
  return JSON.stringify(
    {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date(exportedAt).toISOString(),
      journey: content.journey,
      settings: content.settings,
    },
    null,
    2,
  );
}

export function parseBackup(text: string): Result<BackupContent, BackupError> {
  if (text.length > MAX_BACKUP_BYTES) return err("too_large");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return err("not_json");
  }
  if (typeof parsed !== "object" || parsed === null || !("format" in parsed)) {
    return err("wrong_format");
  }
  const file = parsed as Record<string, unknown>;
  if (file.format !== BACKUP_FORMAT) return err("wrong_format");
  if (file.version !== BACKUP_VERSION) return err("unsupported_version");
  const journey = parseJourney(file.journey);
  if (!journey.ok) return err("invalid_data");
  const settings: Record<string, string> = {};
  const rawSettings = file.settings;
  if (typeof rawSettings === "object" && rawSettings !== null) {
    for (const key of PORTABLE_SETTINGS) {
      const value = (rawSettings as Record<string, unknown>)[key];
      if (typeof value === "string") settings[key] = value;
    }
  }
  return ok({ journey: journey.value, settings });
}

export function backupFileName(at: Instant): string {
  return `approdo-backup-${new Date(at).toISOString().slice(0, 10)}.json`;
}
