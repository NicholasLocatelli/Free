import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { MIN_TOUCH_TARGET, radius, spacing } from "../theme/tokens";
import { AppText } from "./AppText";

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** "multiple" = checkbox semantics (default), "single" = radio semantics. */
  selection?: "multiple" | "single";
}

export function Chip({ label, selected, onPress, selection = "multiple" }: ChipProps) {
  const { colors } = useTheme();
  const multiple = selection === "multiple";
  return (
    <Pressable
      accessibilityRole={multiple ? "checkbox" : "radio"}
      accessibilityLabel={label}
      accessibilityState={multiple ? { checked: selected } : { selected }}
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { backgroundColor: colors.surface, borderColor: colors.outline },
      ]}
    >
      <AppText color={selected ? "onPrimary" : "text"}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1.5,
    justifyContent: "center",
  },
});
