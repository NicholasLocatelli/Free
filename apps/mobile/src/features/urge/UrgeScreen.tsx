import { getCategory, MAX_INTENSITY, MIN_INTENSITY, MAX_NOTE_LENGTH } from "@free/core";
import { useState } from "react";
import { t, type MessageKey } from "../../i18n/it";
import { tagLabel } from "../../i18n/tags";
import { useJourneyStore } from "../../state/JourneyStoreProvider";
import { AppText, Button, Chip, ChoiceGroup, Screen, TextField } from "../../ui";

const INTENSITIES = Array.from(
  { length: MAX_INTENSITY - MIN_INTENSITY + 1 },
  (_, i) => MIN_INTENSITY + i,
);
const DURATION_MAX_LENGTH = 4;

interface UrgeScreenProps {
  onDone: () => void;
  onRelapse: () => void;
  onCancel: () => void;
}

type Outcome = "resisted" | "acted";

/** Urge form (Flow 3). Recording "Sì, ho giocato" never closes the period by itself. */
export function UrgeScreen({ onDone, onRelapse, onCancel }: UrgeScreenProps) {
  const journey = useJourneyStore((s) => s.journey);
  const recordUrge = useJourneyStore((s) => s.recordUrge);
  const createId = useJourneyStore((s) => s.createId);
  const [id] = useState(createId);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [duration, setDuration] = useState("");
  const [coping, setCoping] = useState<readonly string[]>([]);
  const [outcome, setOutcome] = useState<Outcome>("resisted");
  const [note, setNote] = useState("");
  const [error, setError] = useState<MessageKey | null>(null);
  const [saved, setSaved] = useState<Outcome | null>(null);

  if (!journey) return null;
  const category = getCategory(journey.categoryId);

  if (saved === "resisted") {
    const resisted = journey.urges.filter((u) => u.outcome === "resisted").length;
    return (
      <Screen centered>
        <AppText variant="display" accessibilityRole="header">
          {t("urge.resisted", { n: resisted })}
        </AppText>
        <Button label={t("relapse.backToToday")} onPress={onDone} />
      </Screen>
    );
  }

  if (saved === "acted") {
    return (
      <Screen centered>
        <AppText variant="heading" accessibilityRole="header">
          {t("urge.actedThanks")}
        </AppText>
        <Button label={t("today.relapseButton")} onPress={onRelapse} />
        <Button label={t("urge.notNow")} variant="tertiary" onPress={onDone} />
      </Screen>
    );
  }

  const save = async () => {
    if (intensity === null) {
      setError("urge.invalid_intensity");
      return;
    }
    const minutes = duration.trim() === "" ? null : Number(duration.trim());
    const result = await recordUrge({
      id,
      occurredAt: Date.now(),
      intensity,
      trigger,
      durationMinutes: minutes,
      copingActions: coping,
      outcome,
      note,
    });
    if (result.ok) {
      setSaved(outcome);
      return;
    }
    setError(
      result.error === "invalid_duration" || result.error === "invalid_intensity"
        ? `urge.${result.error}`
        : "error.save",
    );
  };

  return (
    <Screen>
      <AppText variant="display" accessibilityRole="header">
        {t("urge.title")}
      </AppText>

      <ChoiceGroup label={t("urge.intensity")}>
        {INTENSITIES.map((value) => (
          <Chip
            key={value}
            selection="single"
            label={String(value)}
            selected={intensity === value}
            onPress={() => {
              setError(null);
              setIntensity(value);
            }}
          />
        ))}
      </ChoiceGroup>

      <ChoiceGroup label={t("urge.trigger")}>
        {category.triggerTags.map((tag) => (
          <Chip
            key={tag}
            selection="single"
            label={tagLabel(tag)}
            selected={trigger === tag}
            onPress={() => {
              setTrigger(trigger === tag ? null : tag);
            }}
          />
        ))}
      </ChoiceGroup>

      <TextField
        label={t("urge.duration")}
        value={duration}
        onChangeText={(text) => {
          setError(null);
          setDuration(text);
        }}
        keyboardType="number-pad"
        maxLength={DURATION_MAX_LENGTH}
      />

      <ChoiceGroup label={t("urge.coping")} selection="multiple">
        {category.copingActionTags.map((tag) => (
          <Chip
            key={tag}
            label={tagLabel(tag)}
            selected={coping.includes(tag)}
            onPress={() => {
              setCoping((current) =>
                current.includes(tag) ? current.filter((c) => c !== tag) : [...current, tag],
              );
            }}
          />
        ))}
      </ChoiceGroup>

      <ChoiceGroup label={t("urge.outcome")}>
        {(["resisted", "acted"] as const).map((value) => (
          <Chip
            key={value}
            selection="single"
            label={t(`urge.outcome.${value}`)}
            selected={outcome === value}
            onPress={() => {
              setOutcome(value);
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

      {error !== null && (
        <AppText color="warning" accessibilityRole="alert">
          {t(error)}
        </AppText>
      )}
      <Button label={t("common.save")} onPress={save} />
      <Button label={t("common.cancel")} variant="tertiary" onPress={onCancel} />
    </Screen>
  );
}
