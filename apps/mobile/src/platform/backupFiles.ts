import { getDocumentAsync } from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import { isAvailableAsync, shareAsync } from "expo-sharing";

/** Device file access for backups. The user always picks the destination and the source. */
export interface BackupFiles {
  /** Writes a temporary file, opens the system share sheet, then deletes the temporary copy. */
  share(fileName: string, contents: string): Promise<"shared" | "unavailable">;
  /** Lets the user pick a file; null when they cancel. */
  pick(): Promise<string | null>;
}

export function createDeviceBackupFiles(): BackupFiles {
  return {
    async share(fileName, contents) {
      if (!(await isAvailableAsync())) return "unavailable";
      const file = new File(Paths.cache, fileName);
      await file.write(contents);
      try {
        await shareAsync(file.uri, { mimeType: "application/json", dialogTitle: fileName });
      } finally {
        if (file.exists) file.delete();
      }
      return "shared";
    },
    async pick() {
      const result = await getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return null;
      const asset = result.assets[0];
      if (!asset) return null;
      const file = new File(asset.uri);
      try {
        return await file.text();
      } finally {
        if (file.exists) file.delete();
      }
    },
  };
}
