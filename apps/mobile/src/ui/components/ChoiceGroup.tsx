import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "../theme/tokens";
import { AppText } from "./AppText";

export interface ChoiceGroupProps {
  label: string;
  /** "single" groups are announced as radio groups; "multiple" as a plain group of checkboxes. */
  selection?: "single" | "multiple";
  children: ReactNode;
}

/** A visible label above a wrapping row of Chips. */
export function ChoiceGroup({ label, selection = "single", children }: ChoiceGroupProps) {
  return (
    <View
      style={styles.group}
      accessibilityLabel={label}
      {...(selection === "single" ? { accessibilityRole: "radiogroup" as const } : {})}
    >
      <AppText variant="bodyStrong">{label}</AppText>
      <View style={styles.row}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.sm },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
