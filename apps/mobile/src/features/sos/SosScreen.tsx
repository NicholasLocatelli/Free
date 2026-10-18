import { useEffect, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { t } from "../../i18n/it";
import { AppText, Button, Screen, spacing } from "../../ui";

export const BREATHING_SECONDS = 60;
export const WAIT_SECONDS = 15 * 60;
const BREATH_PHASE_SECONDS = 4;
const TICK_MS = 1_000;
const SECONDS_PER_MINUTE = 60;

/** Verified 2026-10-02, see docs/product/help-center.md (TVNGA, Istituto Superiore di Sanità). */
export const TVNGA_PHONE = "800558822";

type Mode = "menu" | "breathe" | "wait";

interface SosScreenProps {
  onRecord: () => void;
  onHelp: () => void;
  onClose: () => void;
  openUrl?: (url: string) => Promise<unknown>;
  now?: () => number;
}

const formatClock = (seconds: number) =>
  `${Math.floor(seconds / SECONDS_PER_MINUTE)}:${String(seconds % SECONDS_PER_MINUTE).padStart(2, "0")}`;

/** Remaining seconds computed from the start instant, so backgrounding the app is harmless. */
function useCountdown(totalSeconds: number, now: () => number) {
  const [startedAt] = useState(now);
  const [current, setCurrent] = useState(startedAt);
  useEffect(() => {
    const id = setInterval(() => {
      setCurrent(now());
    }, TICK_MS);
    return () => {
      clearInterval(id);
    };
  }, [now]);
  const elapsed = Math.floor((current - startedAt) / TICK_MS);
  return { elapsed, remaining: Math.max(0, totalSeconds - elapsed) };
}

function GuidedTimer({
  kind,
  onStop,
  onRecord,
  now,
}: {
  kind: "breathe" | "wait";
  onStop: () => void;
  onRecord: () => void;
  now: () => number;
}) {
  const total = kind === "breathe" ? BREATHING_SECONDS : WAIT_SECONDS;
  const { elapsed, remaining } = useCountdown(total, now);
  const inhaling = Math.floor(elapsed / BREATH_PHASE_SECONDS) % 2 === 0;

  if (remaining === 0) {
    return (
      <View style={styles.section}>
        <AppText variant="heading" accessibilityRole="header">
          {t("sos.done")}
        </AppText>
        <Button label={t("sos.record")} onPress={onRecord} />
        <Button label={t("common.close")} variant="tertiary" onPress={onStop} />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {kind === "breathe" ? (
        <AppText variant="display" accessibilityLiveRegion="polite" style={styles.center}>
          {inhaling ? t("sos.breatheIn") : t("sos.breatheOut")}
        </AppText>
      ) : (
        <AppText style={styles.center}>{t("sos.waitBody")}</AppText>
      )}
      <AppText variant="timer" style={styles.center}>
        {formatClock(remaining)}
      </AppText>
      <Button label={t("sos.stop")} variant="secondary" onPress={onStop} />
    </View>
  );
}

const defaultOpenUrl = (url: string) => Linking.openURL(url);

/** "Ho un impulso": immediate techniques first, recording second (Flow 3). */
export function SosScreen({
  onRecord,
  onHelp,
  onClose,
  openUrl = defaultOpenUrl,
  now = Date.now,
}: SosScreenProps) {
  const [mode, setMode] = useState<Mode>("menu");
  const [callFailed, setCallFailed] = useState(false);

  if (mode !== "menu") {
    return (
      <Screen centered>
        <GuidedTimer
          kind={mode}
          now={now}
          onRecord={onRecord}
          onStop={() => {
            setMode("menu");
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen centered>
      <AppText variant="display" accessibilityRole="header">
        {t("sos.title")}
      </AppText>
      <View style={styles.section}>
        <Button
          label={t("sos.breathe")}
          variant="secondary"
          onPress={() => {
            setMode("breathe");
          }}
        />
        <Button
          label={t("sos.wait")}
          variant="secondary"
          onPress={() => {
            setMode("wait");
          }}
        />
        <Button
          label={t("sos.call")}
          variant="secondary"
          onPress={async () => {
            try {
              await openUrl(`tel:${TVNGA_PHONE}`);
            } catch {
              setCallFailed(true);
            }
          }}
        />
        <AppText variant="caption" color="muted">
          {t("sos.callHours")}
        </AppText>
        {callFailed && (
          <AppText color="warning" accessibilityRole="alert" selectable>
            {t("resource.openFailed", { phone: "800 558822" })}
          </AppText>
        )}
      </View>
      <Button label={t("sos.record")} onPress={onRecord} />
      <Button label={t("help.more")} variant="tertiary" onPress={onHelp} />
      <Button label={t("common.close")} variant="tertiary" onPress={onClose} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  center: { textAlign: "center" },
});
