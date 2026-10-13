import { useState } from "react";
import { formatDayTime } from "../../i18n/format";
import { t, type MessageKey } from "../../i18n/it";
import { useJourneyStore } from "../../state/JourneyStoreProvider";
import { AppText, Button, Screen, TextField } from "../../ui";
import { currentTimeText, parseMoment, type MomentInput } from "../shared/formInputs";

const DAYS_MAX_LENGTH = 4;

/** Corrects the start of the current period (e.g. a wrong date chosen in onboarding). */
export function StartSettingsScreen({
  onBack,
  now = Date.now,
}: {
  onBack: () => void;
  now?: () => number;
}) {
  const journey = useJourneyStore((s) => s.journey);
  const editStart = useJourneyStore((s) => s.editCurrentPeriodStart);
  const [input, setInput] = useState<MomentInput>(() => ({
    mode: "past",
    daysAgo: "0",
    time: currentTimeText(now()),
  }));
  const [message, setMessage] = useState<{ key: MessageKey; error: boolean } | null>(null);

  const current = journey?.periods.at(-1);
  if (!current) return null;
  const preview = parseMoment(input, now());

  const save = async () => {
    const parsed = parseMoment(input, now());
    if (!parsed.ok) {
      setMessage({ key: `onboarding.start.${parsed.error}`, error: true });
      return;
    }
    const result = await editStart(parsed.value);
    if (result.ok) setMessage({ key: "settings.saved", error: false });
    else
      setMessage({
        key:
          result.error === "before_previous_period"
            ? "start.before_previous_period"
            : result.error === "in_future"
              ? "onboarding.start.in_future"
              : "error.save",
        error: true,
      });
  };

  return (
    <Screen>
      <Button label={t("common.back")} variant="tertiary" onPress={onBack} />
      <AppText variant="display" accessibilityRole="header">
        {t("settings.start")}
      </AppText>
      <AppText color="muted">
        {t("today.since", { date: formatDayTime(current.startedAt) })}
      </AppText>
      <TextField
        label={t("onboarding.start.daysAgo")}
        value={input.daysAgo}
        onChangeText={(daysAgo) => {
          setMessage(null);
          setInput({ ...input, daysAgo });
        }}
        keyboardType="number-pad"
        maxLength={DAYS_MAX_LENGTH}
      />
      <TextField
        label={t("onboarding.start.time")}
        value={input.time}
        onChangeText={(time) => {
          setMessage(null);
          setInput({ ...input, time });
        }}
        keyboardType="numbers-and-punctuation"
      />
      {preview.ok && (
        <AppText color="muted">
          {t("onboarding.start.preview", { date: formatDayTime(preview.value) })}
        </AppText>
      )}
      {message && (
        <AppText
          color={message.error ? "warning" : "success"}
          accessibilityRole={message.error ? "alert" : "text"}
          accessibilityLiveRegion="polite"
        >
          {t(message.key)}
        </AppText>
      )}
      <Button label={t("common.save")} onPress={save} />
    </Screen>
  );
}
