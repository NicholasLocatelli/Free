import { useRouter } from "expo-router";
import { useState } from "react";
import { PrivacySettingsScreen } from "../../src/features/settings/PrivacySettingsScreen";
import { createDeviceBackupFiles } from "../../src/platform/backupFiles";

export default function PrivacySettings() {
  const router = useRouter();
  const [files] = useState(createDeviceBackupFiles);
  return (
    <PrivacySettingsScreen
      files={files}
      onBack={() => {
        router.back();
      }}
      onDeleted={() => {
        router.dismissTo("/");
      }}
    />
  );
}
