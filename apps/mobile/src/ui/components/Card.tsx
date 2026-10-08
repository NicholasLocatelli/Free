import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { radius, spacing } from "../theme/tokens";

export interface CardProps {
  children: ReactNode;
  /** When set, the whole card is one button; give it a label for screen readers. */
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function Card({ children, onPress, accessibilityLabel }: CardProps) {
  const { colors, scheme } = useTheme();
  const style = [
    styles.card,
    { backgroundColor: colors.surface, borderColor: colors.border },
    scheme === "light" && styles.shadow,
  ];
  if (!onPress) {
    return <View style={style}>{children}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={style}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, borderWidth: 1, padding: spacing.lg, gap: spacing.sm },
  shadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
