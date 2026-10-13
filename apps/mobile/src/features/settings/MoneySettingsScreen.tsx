import type { FrequencyUnit } from "@free/core";
import { useState } from "react";
import { t, type MessageKey } from "../../i18n/it";
import { useJourneyStore } from "../../state/JourneyStoreProvider";
import { AppText, Button, Chip, ChoiceGroup, Screen, TextField, Toggle } from "../../ui";
import { moneyInputFromSettings, parseMoneyInput, type MoneyInput } from "../shared/formInputs";

const UNITS: readonly FrequencyUnit[] = ["day", "week", "month"];

/** Edit or switch off the "money not spent" baseline at any time. */
export function MoneySettingsScreen({ onBack }: { onBack: () => void }) {
  const journey = useJourneyStore((s) => s.journey);
  const updateMoney = useJourneyStore((s) => s.updateMoney);
  const [input, setInput] = useState<MoneyInput | null>(() =>
    journey ? moneyInputFromSettings(journey.money) : null,
  );
  const [message, setMessage] = useState<{ key: MessageKey; error: boolean } | null>(null);

  if (!input) return null;
  const edit = (patch: Partial<MoneyInput>) => {
    setMessage(null);
    setInput({ ...input, ...patch });
  };

  const save = async () => {
    const parsed = parseMoneyInput(input);
    if (!parsed.ok) {
      setMessage({ key: `onboarding.money.${parsed.error}`, error: true });
      return;
    }
    const result = await updateMoney(parsed.value);
    setMessage(
      result.ok ? { key: "settings.saved", error: false } : { key: "error.save", error: true },
    );
  };

  return (
    <Screen>
      <Button label={t("common.back")} variant="tertiary" onPress={onBack} />
      <AppText variant="display" accessibilityRole="header">
        {t("settings.money")}
      </AppText>
      <AppText color="muted">{t("onboarding.money.body")}</AppText>
      <Toggle
        label={t("onboarding.money.toggle")}
        value={input.enabled}
        onValueChange={(enabled) => {
          edit({ enabled });
        }}
      />
      <TextField
        label={t("onboarding.money.amount")}
        value={input.amount}
        onChangeText={(amount) => {
          edit({ amount });
        }}
        keyboardType="decimal-pad"
      />
      <TextField
        label={t("onboarding.money.sessions")}
        value={input.sessions}
        onChangeText={(sessions) => {
          edit({ sessions });
        }}
        keyboardType="decimal-pad"
      />
      <ChoiceGroup label={t("onboarding.money.sessions")}>
        {UNITS.map((unit) => (
          <Chip
            key={unit}
            selection="single"
            label={t(`onboarding.money.unit.${unit}`)}
            selected={input.frequencyUnit === unit}
            onPress={() => {
              edit({ frequencyUnit: unit });
            }}
          />
        ))}
      </ChoiceGroup>
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
