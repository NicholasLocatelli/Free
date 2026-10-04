import type { DurationParts } from "@free/core";
import { View } from "react-native";
import { formatElapsed } from "../../i18n/formatElapsed";
import { AppText } from "./AppText";

export interface TimerProps {
  parts: DurationParts;
}

/**
 * Shows days prominently and hours/minutes below. Seconds are intentionally hidden
 * (less anxiety, fewer re-renders); screen readers get one full sentence.
 */
export function Timer({ parts }: TimerProps) {
  const text = formatElapsed(parts);
  return (
    <View accessible accessibilityLabel={text.accessibilityLabel}>
      <AppText variant="timer" style={{ textAlign: "center" }}>
        {text.headline}
      </AppText>
      <AppText color="muted" style={{ textAlign: "center" }}>
        {text.detail}
      </AppText>
    </View>
  );
}
