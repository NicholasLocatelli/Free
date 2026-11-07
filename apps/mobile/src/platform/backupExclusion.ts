import { requireOptionalNativeModule } from "expo";
import { Platform } from "react-native";

/**
 * Keeps the app data out of iCloud and device backups on iOS (D-014). Android relies on
 * `allowBackup: false` in app.json instead.
 *
 * The native module (modules/backup-exclusion) is compiled into development and release
 * builds only: in Expo Go it is missing and nothing happens. A failure never blocks the
 * app from opening its data.
 */
interface BackupExclusionModule {
  excludeDirectoryFromBackup(path: string): boolean;
}

export type BackupExclusionResult = "excluded" | "not_ios" | "unavailable" | "failed";

export function excludeDirectoryFromBackup(
  directory: string,
  native: BackupExclusionModule | null = requireOptionalNativeModule<BackupExclusionModule>(
    "BackupExclusion",
  ),
  os: string = Platform.OS,
): BackupExclusionResult {
  if (os !== "ios") return "not_ios";
  if (!native) return "unavailable";
  try {
    return native.excludeDirectoryFromBackup(directory) ? "excluded" : "failed";
  } catch {
    return "failed";
  }
}
