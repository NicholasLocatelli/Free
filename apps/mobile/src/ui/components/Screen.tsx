import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";
import { spacing } from "../theme/tokens";

export interface ScreenProps {
  children: ReactNode;
  /** Vertically centres short content (dashboard, loading, errors). */
  centered?: boolean;
}

/**
 * Root of every screen: keeps content clear of the notch, status bar and home indicator
 * (safe-area insets) and scrolls when large fonts make it taller than the display.
 */
export function Screen({ children, centered = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <ScrollView
      testID="screen"
      style={{ backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.content,
        centered && styles.centered,
        {
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xl,
          paddingLeft: insets.left + spacing.lg,
          paddingRight: insets.right + spacing.lg,
        },
      ]}
    >
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}

const MAX_CONTENT_WIDTH = 560;

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  centered: { justifyContent: "center" },
  inner: { gap: spacing.xl, width: "100%", maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center" },
});
