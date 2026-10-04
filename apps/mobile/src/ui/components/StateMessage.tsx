import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "../theme/tokens";
import { AppText } from "./AppText";

interface StateMessageProps {
  title: string;
  body?: string;
  /** Actions such as <Button />; ErrorState always offers at least one. */
  actions?: ReactNode;
}

function StateMessage({ title, body, actions }: StateMessageProps) {
  return (
    <View style={styles.container}>
      <AppText variant="heading" accessibilityRole="header" style={styles.center}>
        {title}
      </AppText>
      {body !== undefined && (
        <AppText color="muted" style={styles.center}>
          {body}
        </AppText>
      )}
      {actions !== undefined && <View style={styles.actions}>{actions}</View>}
    </View>
  );
}

export function EmptyState(props: StateMessageProps) {
  return <StateMessage {...props} />;
}

export interface ErrorStateProps extends StateMessageProps {
  actions: ReactNode;
}

export function ErrorState(props: ErrorStateProps) {
  return <StateMessage {...props} />;
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: spacing.md, padding: spacing.xl },
  center: { textAlign: "center" },
  actions: { alignSelf: "stretch", gap: spacing.sm },
});
