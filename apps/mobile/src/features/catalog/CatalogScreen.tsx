import { DEFAULT_MILESTONE_HOURS, MS_PER_HOUR } from "@free/core";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { t } from "../../i18n/it";
import {
  AppText,
  Button,
  Chip,
  EmptyState,
  ErrorState,
  MilestoneCard,
  ProgressRing,
  ResourceCard,
  Sheet,
  spacing,
  Stat,
  TextField,
  Timer,
  Toggle,
  useThemeContext,
  type ThemePreference,
} from "../../ui";

const PREFERENCES: readonly ThemePreference[] = ["system", "light", "dark"];
const SAMPLE_START = Date.UTC(2026, 8, 20, 19, 40);
const TRIGGERS = ["Noia", "Stress", "Solitudine", "Evento sportivo"] as const;

/** Every design-system component in every main state, for visual checks in both themes. */
export function CatalogScreen() {
  const { preference, setPreference } = useThemeContext();
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppText variant="display" accessibilityRole="header">
        Catalogo componenti
      </AppText>

      <View style={styles.row}>
        {PREFERENCES.map((p) => (
          <Chip
            key={p}
            selection="single"
            label={t(`theme.${p}`)}
            selected={preference === p}
            onPress={() => {
              setPreference(p);
            }}
          />
        ))}
      </View>

      <Button label={t("today.urgeButton")} onPress={() => undefined} />
      <Button label={t("today.relapseButton")} variant="secondary" onPress={() => undefined} />
      <Button label="Azione terziaria" variant="tertiary" onPress={() => undefined} />
      <Button label="Cancella tutti i dati" variant="destructive" onPress={() => undefined} />
      <Button label="Disabilitato" disabled onPress={() => undefined} />

      <ProgressRing value={0.42} accessibilityLabel={t("today.nextGoal", { goal: "7 giorni" })}>
        <AppText variant="heading" color="primary">
          42%
        </AppText>
      </ProgressRing>
      <Timer parts={{ days: 12, hours: 4, minutes: 17, seconds: 0 }} />
      <Stat label={t("money.label")} value="~ 340 €" caption={t("money.caption")} />

      <TextField label="Nota" value={note} onChangeText={setNote} multiline maxLength={2000} />
      <TextField
        label="Importo"
        value="abc"
        onChangeText={() => undefined}
        error="Inserisci un numero"
      />

      <View style={styles.row}>
        {TRIGGERS.map((label) => (
          <Chip
            key={label}
            label={label}
            selected={selected.includes(label)}
            onPress={() => {
              setSelected((s) =>
                s.includes(label) ? s.filter((x) => x !== label) : [...s, label],
              );
            }}
          />
        ))}
      </View>
      <Toggle
        label={t("money.label")}
        description={t("money.caption")}
        value={enabled}
        onValueChange={setEnabled}
      />

      {DEFAULT_MILESTONE_HOURS.slice(0, 3).map((hours, index) => (
        <MilestoneCard
          key={hours}
          hours={hours}
          status={index === 0 ? "reached" : index === 1 ? "next" : "future"}
          {...(index === 0 ? { achievedAt: SAMPLE_START + hours * MS_PER_HOUR } : {})}
        />
      ))}

      <ResourceCard
        resource={{
          name: "Risorsa di esempio",
          description: "Solo per il catalogo: le risorse reali e verificate arrivano in M5.",
          hours: "lun–ven 10:00–16:00",
          url: "https://example.org",
          source: "esempio",
          verifiedAt: SAMPLE_START,
        }}
        openUrl={() => Promise.reject(new Error("catalog"))}
      />

      <EmptyState title={t("history.empty.title")} body={t("history.empty.body")} />
      <ErrorState
        title={t("error.data.title")}
        body={t("error.data.body")}
        actions={<Button label={t("common.retry")} onPress={() => undefined} />}
      />

      <Button
        label="Apri bottom sheet"
        variant="secondary"
        onPress={() => {
          setSheetOpen(true);
        }}
      />
      <Sheet
        visible={sheetOpen}
        title={t("sos.title")}
        onClose={() => {
          setSheetOpen(false);
        }}
      >
        <AppText>Contenuto del bottom sheet.</AppText>
      </Sheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.lg },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
