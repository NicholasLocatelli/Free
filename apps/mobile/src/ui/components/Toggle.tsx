import { Pressable, StyleSheet, Switch, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { MIN_TOUCH_TARGET, spacing } from "../theme/tokens";
import { AppText } from "./AppText";

export interface ToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
}

/** Labelled switch; the whole row is the touch target. */
export function Toggle({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
}: ToggleProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => {
        onValueChange(!value);
      }}
      style={styles.row}
    >
      <View style={styles.text}>
        <AppText>{label}</AppText>
        {description !== undefined && (
          <AppText variant="caption" color="muted">
            {description}
          </AppText>
        )}
      </View>
      <Switch
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: colors.primary, false: colors.outline }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  text: { flex: 1 },
});
