import type { FrequencyUnit } from "@free/core";
import { useState, type ReactNode } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { formatDayTime, formatGoal } from "../../i18n/format";
import { t, type MessageKey } from "../../i18n/it";
import { useJourneyStore } from "../../state/JourneyStoreProvider";
import { AppText, Button, Chip, spacing, TextField, Toggle, useTheme } from "../../ui";
import {
  currentTimeText,
  FIRST_GOAL_OPTIONS,
  milestonesFromFirstGoal,
  nextStep,
  ONBOARDING_STEPS,
  parseMoney,
  parseStart,
  previousStep,
  type OnboardingDraft,
  type OnboardingStep,
} from "./onboardingModel";
import { useOnboardingProgress } from "./useOnboardingProgress";

const UNITS: readonly FrequencyUnit[] = ["day", "week", "month"];
const DAYS_MAX_LENGTH = 4;

interface OnboardingFlowProps {
  /** Injected for tests; defaults to the device clock. */
  now?: () => number;
}

/** Flow 1 of docs/ux/user-flows.md. Creates the journey only on the last step. */
export function OnboardingFlow({ now = Date.now }: OnboardingFlowProps) {
  const { progress, update, clear } = useOnboardingProgress();
  const start = useJourneyStore((s) => s.start);
  const { colors } = useTheme();
  const [error, setError] = useState<MessageKey | null>(null);

  if (!progress) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} accessibilityLabel="Caricamento" />
      </View>
    );
  }

  const { step, draft } = progress;
  const edit = (patch: Partial<OnboardingDraft>) => {
    setError(null);
    update({ step, draft: { ...draft, ...patch } });
  };
  const goTo = (target: OnboardingStep | null) => {
    if (target) {
      setError(null);
      update({ step: target, draft });
    }
  };

  // Intermediate steps are synchronous, so the button never shows a busy state between
  // steps; only the last step awaits the save (and guards against double submit).
  const advance = () => {
    if (step === "start") {
      const parsed = parseStart(draft, now());
      if (!parsed.ok) {
        setError(`onboarding.start.${parsed.error}`);
        return;
      }
    }
    goTo(nextStep(step));
  };

  const finish = async () => {
    const startedAt = parseStart(draft, now());
    if (!startedAt.ok) {
      setError(`onboarding.start.${startedAt.error}`);
      return;
    }
    const money = parseMoney(draft);
    if (!money.ok) {
      setError(`onboarding.money.${money.error}`);
      return;
    }
    const result = await start({
      categoryId: "gambling",
      startedAt: startedAt.value,
      milestoneHours: milestonesFromFirstGoal(draft.firstGoalHours),
      ...(money.value ? { money: money.value } : {}),
    });
    if (result.ok) {
      await clear();
      return;
    }
    // Only a failed write is a save error; a rejected start time gets its own message.
    setError(
      result.error === "in_future" || result.error === "invalid_instant"
        ? "onboarding.start.in_future"
        : "error.save",
    );
  };

  const index = ONBOARDING_STEPS.indexOf(step);
  const back = previousStep(step);
  const primaryLabel =
    step === "welcome"
      ? t("onboarding.welcome.cta")
      : step === "money"
        ? t("onboarding.finish")
        : t("common.continue");

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <AppText variant="caption" color="muted">
        {t("onboarding.progress", { n: index + 1, total: ONBOARDING_STEPS.length })}
      </AppText>
      <StepContent step={step} draft={draft} edit={edit} now={now} />
      {error !== null && (
        <AppText color="warning" accessibilityRole="alert">
          {t(error)}
        </AppText>
      )}
      <View style={styles.actions}>
        <Button label={primaryLabel} onPress={step === "money" ? finish : advance} />
        {back !== null && (
          <Button
            label={t("common.back")}
            variant="tertiary"
            onPress={() => {
              goTo(back);
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}

interface StepProps {
  step: OnboardingStep;
  draft: OnboardingDraft;
  edit: (patch: Partial<OnboardingDraft>) => void;
  now: () => number;
}

function Title({ children }: { children: ReactNode }) {
  return (
    <AppText variant="display" accessibilityRole="header">
      {children}
    </AppText>
  );
}

function StepContent({ step, draft, edit, now }: StepProps) {
  switch (step) {
    case "welcome":
      return (
        <View style={styles.section}>
          <Title>{t("onboarding.welcome.title")}</Title>
          <AppText>{t("onboarding.welcome.notTherapy")}</AppText>
          <AppText>{t("onboarding.welcome.local")}</AppText>
          <AppText>{t("onboarding.welcome.adults")}</AppText>
        </View>
      );

    case "category":
      return (
        <View style={styles.section}>
          <Title>{t("onboarding.category.title")}</Title>
          <View style={styles.row}>
            <Chip
              selection="single"
              label={t("category.gambling.name")}
              selected
              onPress={() => undefined}
            />
          </View>
        </View>
      );

    case "start": {
      const preview = parseStart(draft, now());
      return (
        <View style={styles.section}>
          <Title>{t("onboarding.start.title")}</Title>
          <View style={styles.row}>
            <Chip
              selection="single"
              label={t("onboarding.start.now")}
              selected={draft.startMode === "now"}
              onPress={() => {
                edit({ startMode: "now" });
              }}
            />
            <Chip
              selection="single"
              label={t("onboarding.start.past")}
              selected={draft.startMode === "past"}
              onPress={() => {
                edit({ startMode: "past", time: draft.time || currentTimeText(now()) });
              }}
            />
          </View>
          {draft.startMode === "past" && (
            <>
              <TextField
                label={t("onboarding.start.daysAgo")}
                value={draft.daysAgo}
                onChangeText={(daysAgo) => {
                  edit({ daysAgo });
                }}
                keyboardType="number-pad"
                maxLength={DAYS_MAX_LENGTH}
              />
              <TextField
                label={t("onboarding.start.time")}
                value={draft.time}
                onChangeText={(time) => {
                  edit({ time });
                }}
                keyboardType="numbers-and-punctuation"
              />
              {preview.ok && (
                <AppText color="muted">
                  {t("onboarding.start.preview", { date: formatDayTime(preview.value) })}
                </AppText>
              )}
            </>
          )}
        </View>
      );
    }

    case "goal":
      return (
        <View style={styles.section}>
          <Title>{t("onboarding.goal.title")}</Title>
          <AppText color="muted">{t("onboarding.goal.body")}</AppText>
          <View style={styles.row}>
            {FIRST_GOAL_OPTIONS.map((hours) => (
              <Chip
                key={hours}
                selection="single"
                label={formatGoal(hours)}
                selected={draft.firstGoalHours === hours}
                onPress={() => {
                  edit({ firstGoalHours: hours });
                }}
              />
            ))}
          </View>
        </View>
      );

    case "money":
      return (
        <View style={styles.section}>
          <Title>{t("onboarding.money.title")}</Title>
          <AppText color="muted">{t("onboarding.money.body")}</AppText>
          <Toggle
            label={t("onboarding.money.toggle")}
            value={draft.moneyEnabled}
            onValueChange={(moneyEnabled) => {
              edit({ moneyEnabled });
            }}
          />
          {draft.moneyEnabled && (
            <>
              <TextField
                label={t("onboarding.money.amount")}
                value={draft.amount}
                onChangeText={(amount) => {
                  edit({ amount });
                }}
                keyboardType="decimal-pad"
              />
              <TextField
                label={t("onboarding.money.sessions")}
                value={draft.sessions}
                onChangeText={(sessions) => {
                  edit({ sessions });
                }}
                keyboardType="decimal-pad"
              />
              <View style={styles.row}>
                {UNITS.map((unit) => (
                  <Chip
                    key={unit}
                    selection="single"
                    label={t(`onboarding.money.unit.${unit}`)}
                    selected={draft.frequencyUnit === unit}
                    onPress={() => {
                      edit({ frequencyUnit: unit });
                    }}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.xl, flexGrow: 1 },
  center: { flex: 1, justifyContent: "center" },
  section: { gap: spacing.lg },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  actions: { gap: spacing.sm, marginTop: "auto" },
});
