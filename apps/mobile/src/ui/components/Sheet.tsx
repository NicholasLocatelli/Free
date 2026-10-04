import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { t } from "../../i18n/it";
import { useTheme } from "../theme/ThemeProvider";
import { radius, spacing } from "../theme/tokens";
import { AppText } from "./AppText";
import { Button } from "./Button";

export interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const SCRIM_COLOR = "rgba(0, 0, 0, 0.4)";

/** Bottom sheet with an explicit close button; slides only when motion is allowed. */
export function Sheet({ visible, title, onClose, children }: SheetProps) {
  const { colors, reduceMotion } = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? "fade" : "slide"}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
          onPress={onClose}
        />
        <View accessibilityViewIsModal style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <AppText variant="heading" accessibilityRole="header">
            {title}
          </AppText>
          {children}
          <Button label={t("common.close")} variant="tertiary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: SCRIM_COLOR },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
  },
});
