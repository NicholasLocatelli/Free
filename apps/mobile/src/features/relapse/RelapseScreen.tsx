import { getCategory, MAX_NOTE_LENGTH, periodDurationMs } from "@free/core";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { formatDayTime, formatDuration } from "../../i18n/format";
import { t, type MessageKey } from "../../i18n/it";
import { tagLabel } from "../../i18n/tags";
import { useJourneyStore } from "../../state/JourneyStoreProvider";
import {
  AppText,
  Button,
  Chip,
  ChoiceGroup,
  ResourceCard,
  Screen,
  spacing,
  TextField,
} from "../../ui";
import { TVNGA } from "../help/resources";
import { currentTimeText, parseMoment, type MomentInput } from "../shared/formInputs";

type Step = "when" | "reflect" | "done";
const DAYS_MAX_LENGTH = 4;

interface RelapseScreenProps {
  onDone: () => void;
  onCancel: () => void;
  now?: () => number;
}

/**
 * Flow 4. Never says "failed" or "reset": the previous period is closed, kept in history
 * with its milestones, and a new period starts. Factors and note are optional.
 */
export function RelapseScreen({ onDone, onCancel, now = Date.now }: RelapseScreenProps) {
  const journey = useJourneyStore((s) => s.journey);
  const recordRelapse = useJourneyStore((s) => s.recordRelapse);
  const [step, setStep] = useState<Step>("when");
  const [moment, setMoment] = useState<MomentInput>({ mode: "now", daysAgo: "0", time: "" });
  const [factors, setFactors] = useState<readonly string[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<MessageKey | null>(null);

  if (!journey) return null;
  const openPeriod = journey.periods.at(-1);

  if (step === "done") {
    const closed = journey.periods.at(-2);
    return (
      <Screen centered>
        <AppText variant="display" accessibilityRole="header">
          {t("relapse.title")}
        </AppText>
        {closed && (
          <AppText>
            {t("relapse.doneBody", { duration: formatDuration(periodDurationMs(closed, now())) })}
          </AppText>
        )}
        <AppText variant="heading">{t("relapse.supportTitle")}</AppText>
        <ResourceCard resource={TVNGA} />
        <Button label={t("relapse.backToToday")} onPress={onDone} />
      </Screen>
    );
  }

  const edit = (patch: Partial<MomentInput>) => {
    setError(null);
    setMoment((m) => ({ ...m, ...patch }));
  };

  const validateWhen = (): number | null => {
    const parsed = parseMoment(moment, now());
    if (!parsed.ok) {
      setError(`onboarding.start.${parsed.error}`);
      return null;
    }
    if (openPeriod && parsed.value < openPeriod.startedAt) {
      setError("relapse.before_period_start");
      return null;
    }
    return parsed.value;
  };

  if (step === "when") {
    const preview = parseMoment(moment, now());
    return (
      <Screen>
        <AppText variant="display" accessibilityRole="header">
          {t("today.relapseButton")}
        </AppText>
        <AppText>{t("relapse.intro")}</AppText>
        <ChoiceGroup label={t("relapse.when")}>
          <Chip
            selection="single"
            label={t("onboarding.start.now")}
            selected={moment.mode === "now"}
            onPress={() => {
              edit({ mode: "now" });
            }}
          />
          <Chip
            selection="single"
            label={t("onboarding.start.past")}
            selected={moment.mode === "past"}
            onPress={() => {
              edit({ mode: "past", time: moment.time || currentTimeText(now()) });
            }}
          />
        </ChoiceGroup>
        {moment.mode === "past" && (
          <>
            <TextField
              label={t("onboarding.start.daysAgo")}
              value={moment.daysAgo}
              onChangeText={(daysAgo) => {
                edit({ daysAgo });
              }}
              keyboardType="number-pad"
              maxLength={DAYS_MAX_LENGTH}
            />
            <TextField
              label={t("onboarding.start.time")}
              value={moment.time}
              onChangeText={(time) => {
                edit({ time });
              }}
              keyboardType="numbers-and-punctuation"
            />
            {preview.ok && <AppText color="muted">{formatDayTime(preview.value)}</AppText>}
          </>
        )}
        <ErrorText error={error} />
        <Button
          label={t("common.continue")}
          onPress={() => {
            if (validateWhen() !== null) setStep("reflect");
          }}
        />
        <Button label={t("common.cancel")} variant="tertiary" onPress={onCancel} />
      </Screen>
    );
  }

  const save = async () => {
    const occurredAt = validateWhen();
    if (occurredAt === null) return;
    const result = await recordRelapse({ occurredAt, contributingFactors: factors, note });
    if (result.ok) {
      setStep("done");
      return;
    }
    setError(
      result.error === "before_period_start"
        ? "relapse.before_period_start"
        : result.error === "in_future"
          ? "onboarding.start.in_future"
          : "error.save",
    );
  };

  return (
    <Screen>
      <AppText variant="display" accessibilityRole="header">
        {t("relapse.reflectTitle")}
      </AppText>
      <AppText color="muted">{t("relapse.reflectBody")}</AppText>
      <ChoiceGroup label={t("relapse.reflectTitle")} selection="multiple">
        {getCategory(journey.categoryId).triggerTags.map((tag) => (
          <Chip
            key={tag}
            label={tagLabel(tag)}
            selected={factors.includes(tag)}
            onPress={() => {
              setFactors((current) =>
                current.includes(tag) ? current.filter((f) => f !== tag) : [...current, tag],
              );
            }}
          />
        ))}
      </ChoiceGroup>
      <TextField
        label={t("urge.note")}
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={MAX_NOTE_LENGTH}
      />
      <ErrorText error={error} />
      <View style={styles.actions}>
        <Button label={t("relapse.save")} onPress={save} />
        <Button
          label={t("common.back")}
          variant="tertiary"
          onPress={() => {
            setStep("when");
          }}
        />
      </View>
    </Screen>
  );
}

function ErrorText({ error }: { error: MessageKey | null }) {
  if (error === null) return null;
  return (
    <AppText color="warning" accessibilityRole="alert">
      {t(error)}
    </AppText>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
});
