import { ActivityIndicator } from "react-native";
import { t } from "../../i18n/it";
import { useNow } from "../../platform/useNow";
import { useJourneyStore } from "../../state/JourneyStoreProvider";
import { Button, ErrorState, Screen, useTheme } from "../../ui";
import { OnboardingFlow } from "../onboarding/OnboardingFlow";
import { TodayScreen, type TodayActions } from "../today/TodayScreen";

/**
 * Entry route: loading → error (with retry) → onboarding → dashboard.
 */
export function HomeScreen({ actions }: { actions: TodayActions }) {
  const boot = useJourneyStore((s) => s.boot);
  const journey = useJourneyStore((s) => s.journey);
  const load = useJourneyStore((s) => s.load);
  const now = useNow();
  const { colors } = useTheme();

  if (boot.status === "loading") {
    return (
      <Screen centered>
        <ActivityIndicator color={colors.primary} accessibilityLabel="Caricamento" />
      </Screen>
    );
  }

  if (boot.status === "error") {
    return (
      <Screen centered>
        <ErrorState
          title={t("error.data.title")}
          body={t("error.data.body")}
          actions={<Button label={t("common.retry")} onPress={load} />}
        />
      </Screen>
    );
  }

  if (!journey) {
    return <OnboardingFlow />;
  }

  return <TodayScreen journey={journey} now={now} {...actions} />;
}
