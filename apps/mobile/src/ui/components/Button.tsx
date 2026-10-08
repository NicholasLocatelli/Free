import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import {
  MIN_TOUCH_TARGET,
  PRIMARY_BUTTON_HEIGHT,
  radius,
  spacing,
  type ColorTokens,
} from "../theme/tokens";
import { AppText } from "./AppText";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";

export interface ButtonProps {
  label: string;
  /** May return a promise: the button stays disabled until it settles (no double submit). */
  onPress: () => unknown;
  variant?: ButtonVariant;
  disabled?: boolean;
  accessibilityHint?: string;
}

const PRESSED_OPACITY = 0.85;
const DISABLED_OPACITY = 0.5;

function variantStyle(variant: ButtonVariant, colors: ColorTokens) {
  switch (variant) {
    case "primary":
      return { container: { backgroundColor: colors.primary }, text: "onPrimary" as const };
    case "destructive":
      return { container: { backgroundColor: colors.danger }, text: "onDanger" as const };
    case "secondary":
      return {
        container: {
          borderWidth: 1.5,
          borderColor: colors.primary,
          backgroundColor: "transparent",
        },
        text: "primary" as const,
      };
    case "tertiary":
      return { container: { backgroundColor: "transparent" }, text: "primary" as const };
  }
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const [busy, setBusy] = useState(false);
  const inactive = disabled || busy;
  const look = variantStyle(variant, colors);

  const handlePress = () => {
    if (inactive) return;
    const result = onPress();
    if (result instanceof Promise) {
      setBusy(true);
      void result.finally(() => {
        setBusy(false);
      });
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy }}
      disabled={inactive}
      onPress={handlePress}
      style={({ pressed }): ViewStyle[] => [
        styles.base,
        variant === "primary" || variant === "destructive" ? styles.prominent : styles.regular,
        look.container,
        { opacity: inactive ? DISABLED_OPACITY : pressed ? PRESSED_OPACITY : 1 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={colors[look.text]} />
      ) : (
        <AppText variant="bodyStrong" color={look.text} style={styles.label}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  prominent: { minHeight: PRIMARY_BUTTON_HEIGHT },
  regular: { minHeight: MIN_TOUCH_TARGET },
  label: { textAlign: "center" },
});
