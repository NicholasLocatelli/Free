import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../theme/ThemeProvider";

export interface ProgressRingProps {
  /** 0..1; values outside the range are clamped. */
  value: number;
  /** Describes what the progress refers to, e.g. "Verso 7 giorni". */
  accessibilityLabel: string;
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
}

const PERCENT = 100;
const DEFAULT_SIZE = 240;
const DEFAULT_STROKE = 12;

export const clampProgress = (value: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;

/** Static ring (no animation), so it is already compliant with "reduce motion". */
export function ProgressRing({
  value,
  accessibilityLabel,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
  children,
}: ProgressRingProps) {
  const { colors } = useTheme();
  const progress = clampProgress(value);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const center = size / 2;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: PERCENT, now: Math.round(progress * PERCENT) }}
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
});
