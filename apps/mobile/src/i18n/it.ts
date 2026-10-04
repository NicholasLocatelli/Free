/**
 * Italian copy. Tone rules: docs/ux/design-system.md §2 (no blame, no clinical promises,
 * estimates labelled as estimates). Placeholders use {name}.
 */
export const messages = {
  "common.close": "Chiudi",
  "common.retry": "Riprova",
  "common.save": "Salva",
  "common.cancel": "Annulla",
  "today.title": "Oggi",
  "today.urgeButton": "Ho un impulso",
  "today.relapseButton": "Registra una ricaduta",
  "today.since": "Dal {date}",
  "today.nextGoal": "Prossimo obiettivo: {goal}",
  "today.allGoalsReached": "Hai raggiunto tutti i tuoi obiettivi.",
  "today.clockSkew":
    "L'ora del dispositivo sembra cambiata. Il conteggio riprenderà automaticamente.",
  "sos.title": "Questo momento passerà. Proviamo insieme.",
  "urge.resisted": "Hai superato un impulso. Sono {n} finora.",
  "relapse.title": "Il percorso continua.",
  "milestone.reachedMessage": "Hai raggiunto {goal}. Prenditi un momento per riconoscerlo.",
  "milestone.reachedOn": "Raggiunto il {date}",
  "milestone.next": "Prossimo obiettivo",
  "milestone.future": "Da raggiungere",
  "money.label": "Stima del denaro non speso",
  "money.caption": "Basata su quanto ci hai indicato",
  "history.empty.title": "Il tuo storico crescerà con te.",
  "history.empty.body": "Qui troverai i tuoi periodi e i tuoi impulsi.",
  "error.data.title": "Non riusciamo a leggere i dati",
  "error.data.body": "I tuoi dati non sono stati cancellati. Puoi riprovare.",
  "resource.call": "Chiama {phone}",
  "resource.open": "Apri il sito",
  "resource.verified": "Fonte: {source} · verificato il {date}",
  "resource.openFailed": "Non è stato possibile aprire il collegamento. Numero: {phone}",
  "theme.system": "Sistema",
  "theme.light": "Chiaro",
  "theme.dark": "Scuro",
} as const;

export type MessageKey = keyof typeof messages;

export function t(key: MessageKey, vars: Readonly<Record<string, string | number>> = {}): string {
  return messages[key].replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}
