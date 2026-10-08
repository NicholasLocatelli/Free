import { useId } from "react";
import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { MIN_TOUCH_TARGET, radius, spacing, typography } from "../theme/tokens";
import { AppText } from "./AppText";

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  /** Shown as text (never only as a red border). */
  error?: string;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
}

export function TextField({
  label,
  value,
  onChangeText,
  error,
  multiline = false,
  maxLength,
  keyboardType,
  placeholder,
}: TextFieldProps) {
  const { colors } = useTheme();
  const labelId = useId();
  const hasError = error !== undefined;

  return (
    <View style={styles.container}>
      <AppText nativeID={labelId} variant="bodyStrong">
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityLabelledBy={labelId}
        accessibilityHint={error}
        allowFontScaling
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        maxLength={maxLength}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[
          typography.body,
          styles.input,
          multiline && styles.multiline,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: hasError ? colors.danger : colors.outline,
          },
        ]}
      />
      <View style={styles.footer}>
        {hasError ? (
          <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">
            {error}
          </AppText>
        ) : (
          <View />
        )}
        {maxLength !== undefined && (
          <AppText variant="caption" color="muted">
            {`${value.length}/${maxLength}`}
          </AppText>
        )}
      </View>
    </View>
  );
}

const MULTILINE_MIN_HEIGHT = 120;

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  input: {
    minHeight: MIN_TOUCH_TARGET,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multiline: { minHeight: MULTILINE_MIN_HEIGHT, textAlignVertical: "top" },
  footer: { flexDirection: "row", justifyContent: "space-between" },
});
