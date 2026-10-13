/** Italian labels for the tag ids declared by recovery categories in @free/core. */
const TAG_LABELS: Readonly<Record<string, string>> = {
  boredom: "Noia",
  stress: "Stress",
  loneliness: "Solitudine",
  money_available: "Soldi disponibili",
  sports_event: "Evento sportivo",
  advertising: "Pubblicità",
  alcohol: "Alcol",
  conflict: "Conflitto",
  celebration: "Festeggiamento",
  breathing: "Respirare",
  waited_it_out: "Aspettare",
  called_someone: "Chiamare qualcuno",
  went_outside: "Uscire",
  physical_activity: "Attività fisica",
  distraction: "Distrarmi",
  used_blocker: "Usare un blocco dei siti",
  other: "Altro",
};

export const tagLabel = (tag: string): string => TAG_LABELS[tag] ?? tag;
