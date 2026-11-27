import type { HelpSectionId, SectionText } from "./sections";

/**
 * Help Center texts in Italian, valid in every country: anything country-specific (numbers,
 * services, laws) lives in countries/. Self-help suggestions are general and framed as
 * options; they still need a professional review before the beta (issue #17).
 */
export const IT_SECTIONS: Readonly<Record<HelpSectionId, SectionText>> = {
  urge: {
    title: "Ho un impulso adesso",
    summary: "Cose che puoi fare nei prossimi minuti.",
    body: [
      "Gli impulsi tendono a salire, raggiungere un picco e poi scendere. Non devi decidere niente adesso.",
      "• Aspetta 15 minuti e osserva l'impulso senza agire.",
      "• Respira lentamente per un minuto.",
      "• Cambia ambiente: esci, cammina, allontanati dal telefono o dal luogo di gioco.",
      "• Scrivi o chiama una persona di fiducia.",
      "• Ricorda perché hai iniziato questo percorso.",
      "• Rendi più difficile l'accesso immediato a soldi e carte.",
      'Dalla Dashboard, "Ho un impulso" ti guida nella respirazione e nell\'attesa.',
    ],
  },
  "after-relapse": {
    title: "Ho giocato",
    summary: "Cosa puoi fare dopo una ricaduta.",
    body: [
      "Una ricaduta non cancella il percorso fatto. I tuoi periodi precedenti e i traguardi raggiunti restano nello storico.",
      "• Se puoi, registra la ricaduta: aiuta a riconoscere i momenti difficili.",
      "• Pensa a cosa c'era prima: un'emozione, un luogo, una persona, del denaro disponibile.",
      "• Parlarne con qualcuno di cui ti fidi può aiutare.",
      "• Se ti preoccupa il denaro speso, un servizio di cura può aiutarti anche su questo.",
    ],
  },
  professional: {
    title: "Trova aiuto professionale",
    summary: "Servizi, linee d'ascolto e gruppi.",
    body: [
      "Non devi affrontare tutto in solitudine: esistono servizi specializzati, linee d'ascolto e gruppi di auto-mutuo aiuto.",
    ],
  },
  protect: {
    title: "Strumenti per proteggerti",
    summary: "Ridurre le occasioni di giocare.",
    body: [
      "Mettere distanza tra te e il gioco rende più facile superare i momenti difficili.",
      "• Molte banche permettono di impostare limiti o blocchi sui pagamenti: chiedi alla tua.",
      "• Disattiva notifiche, email e app di scommesse o casinò.",
    ],
  },
  emergency: {
    title: "Se sei in pericolo",
    summary: "Emergenze e ascolto immediato.",
    body: [
      "Se tu o qualcun altro siete in pericolo immediato, chiama subito il numero di emergenza.",
      "Se ti senti in difficoltà e hai bisogno di parlare, c'è chi ascolta.",
    ],
  },
  faq: {
    title: "Domande frequenti",
    summary: "Privacy, stima del denaro, ricadute.",
    body: [],
    faq: [
      {
        question: "Questa app è una terapia?",
        answer:
          'No. È uno strumento personale per seguire il tuo percorso. Per un supporto professionale puoi rivolgerti ai servizi elencati in "Trova aiuto professionale".',
      },
      {
        question: "Se ricado perdo tutto?",
        answer:
          "No. Il periodo precedente resta nello storico con i suoi traguardi, e il tempo totale continua a contare.",
      },
      {
        question: "Chi vede i miei dati?",
        answer:
          "Nessuno: restano su questo telefono. L'app non ha account e non invia i tuoi dati in rete.",
      },
      {
        question: "Il denaro mostrato è reale?",
        answer:
          "È una stima basata su quanto ci hai indicato. Puoi modificarla o disattivarla dalle Impostazioni.",
      },
      {
        question: "Posso cambiare la data di inizio?",
        answer: "Sì, da Impostazioni → Inizio del periodo in corso.",
      },
    ],
  },
  about: {
    title: "Informazioni sull'app",
    summary: "Cosa fa e cosa non fa.",
    body: [
      "Questa app non è una terapia e non sostituisce un professionista.",
      "I tuoi dati restano sul telefono: nessun account, nessuna pubblicità, nessun invio in rete.",
      "Le risorse sono verificate su fonti ufficiali; ogni scheda indica la fonte e la data di verifica.",
    ],
  },
};
