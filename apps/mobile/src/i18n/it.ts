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
  "common.back": "Indietro",
  "common.continue": "Continua",
  "onboarding.progress": "Passo {n} di {total}",
  "onboarding.welcome.title": "Uno spazio privato per seguire il tuo percorso.",
  "onboarding.welcome.notTherapy": "Non è una terapia e non sostituisce un professionista.",
  "onboarding.welcome.local": "I tuoi dati restano su questo telefono.",
  "onboarding.welcome.adults": "L'app è pensata per persone maggiorenni.",
  "onboarding.welcome.cta": "Inizia",
  "onboarding.category.title": "Per cosa vuoi iniziare il percorso?",
  "onboarding.start.title": "Quando vuoi iniziare?",
  "onboarding.start.now": "Adesso",
  "onboarding.start.past": "Prima di adesso",
  "onboarding.start.daysAgo": "Quanti giorni fa?",
  "onboarding.start.time": "A che ora? (hh:mm)",
  "onboarding.start.preview": "Inizio: {date}",
  "onboarding.start.invalid_days": "Inserisci un numero di giorni tra 0 e 3650.",
  "onboarding.start.invalid_time": "Inserisci un orario come 21:40.",
  "onboarding.start.in_future": "L'inizio non può essere nel futuro.",
  "onboarding.goal.title": "Qual è il tuo primo obiettivo?",
  "onboarding.goal.body": "Piccoli traguardi aiutano. Gli obiettivi successivi seguiranno da soli.",
  "onboarding.money.title": "Vuoi vedere una stima del denaro non speso?",
  "onboarding.money.toggle": "Mostra la stima",
  "onboarding.money.body":
    "È una stima basata su quanto indichi, non una cifra esatta. Puoi saltare.",
  "onboarding.money.amount": "Quanto spendevi in media ogni volta? (€)",
  "onboarding.money.sessions": "Quante volte?",
  "onboarding.money.unit.day": "Al giorno",
  "onboarding.money.unit.week": "Alla settimana",
  "onboarding.money.unit.month": "Al mese",
  "onboarding.money.invalid_amount": "Inserisci un importo come 20 o 12,50.",
  "onboarding.money.invalid_sessions": "Inserisci un numero maggiore di 0 (massimo 100).",
  "onboarding.finish": "Inizia il percorso",
  "category.gambling.name": "Gioco d'azzardo",
  "error.save": "Non è stato possibile salvare. Riprova.",
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
