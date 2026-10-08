# User Flows

_Owner: UX Architect Agent. Review: A3, A4, Accessibility, QA. 2026-10-02._

Ogni flow elenca stati, errori e recovery. I comandi di dominio citati esistono in `@free/core`.

## Flow 1 — Onboarding (prima apertura)

```
Welcome ──▶ Categoria ──▶ Inizio ──▶ Primo obiettivo ──▶ Denaro (opz.) ──▶ Dashboard
(lo step Notifiche arriva con la funzione in M6, D-018)
```

| Step            | Contenuto                                                                                                                                  | Note                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Welcome         | "Uno spazio privato per seguire il tuo percorso." · "Non è una terapia." · "I tuoi dati restano su questo telefono." · dichiarazione 18+   | CTA "Inizia"                                                                                                           |
| Categoria       | Gioco d'azzardo (selezionabile). Altre categorie **non mostrate** nell'MVP (D-011).                                                        | Step auto-saltato finché esiste 1 sola categoria? → **No**: mostrato per chiarezza e futura estensione, preselezionato |
| Inizio          | "Da quando?" → _Adesso_ (default) / _Scegli data e ora_ (picker, non nel futuro)                                                           | `createJourney` → errore `in_future` impossibile da UI; fallback messaggio                                             |
| Primo obiettivo | Suggerito "24 ore"; scelte 24h / 3 / 7 / 30 giorni                                                                                         | Imposta la milestone in evidenza; le altre restano attive                                                              |
| Denaro          | "Vuoi vedere una stima del denaro non speso?" Sì → importo medio per sessione + frequenza (giorno/settimana/mese). "Salta" sempre visibile | Validazione `validateMoneySettings`                                                                                    |
| Notifiche       | Spiegazione + anteprima testo neutro → richiesta permesso OS solo se "Attiva"                                                              | Mai richiesta permesso a freddo                                                                                        |
| Dashboard       | Stato "primo giorno"                                                                                                                       |                                                                                                                        |

**Edge:** app chiusa a metà → si riprende dall'ultimo step (stato onboarding persistito);
nessun percorso viene creato finché lo step Inizio non è confermato.

## Flow 2 — Check quotidiano (Dashboard)

Apri app → Dashboard mostra: periodo corrente (giorni grandi + ore/min), "Dal 12 marzo, 21:40",
anello verso la prossima milestone, stima denaro (se attiva), pulsanti **Ho un impulso** (primario)
e **Registra una ricaduta** (secondario), accesso **Aiuto** in header.

Stati: normale · primo giorno · tutte le milestone raggiunte · **clock skew** (orologio del
telefono indietro: banner "L'ora del dispositivo sembra cambiata. Il conteggio riprenderà
automaticamente." e timer fermo a 0, nessun dato modificato) · errore DB (vedi Flow 8).

## Flow 3 — Ho un impulso

```
Dashboard ─[Ho un impulso]─▶ SOS
SOS: "Questo momento passerà. Proviamo insieme."
     ├─ Respira (1 min) / Aspetta 15 min (timer guidato)
     ├─ Chiama qualcuno (TVNGA, contatto di fiducia — V1)
     └─ Registra l'impulso ─▶ Form
Form: intensità (1–10, slider con valori discreti, default vuoto) · trigger (chip) ·
      durata (opz.) · cosa ho fatto (chip multipli) · "Ho giocato?" No / Sì · nota (opz.)
  ├─ No  ─▶ "Hai superato un impulso. Sono X finora." ─▶ Dashboard
  └─ Sì  ─▶ "Grazie per averlo registrato." ─▶ offre Flow 4 (non automatico)
```

Validazioni (`recordUrge`): intensità obbligatoria intera 1–10; durata 0–1440 min; orario non nel
futuro. Il pulsante Salva si disabilita al primo tap (anti doppio tap) e l'id è generato
all'apertura del form (rifiuto `duplicate_id` lato dominio).

## Flow 4 — Registrare una ricaduta

1. **Conferma** — "Vuoi registrare che hai giocato? Il tuo percorso precedente resterà nello
   storico." · Quando? (_Adesso_ / scegli orario ≥ inizio periodo) · [Registra] [Annulla]
2. **Salvataggio** — `recordRelapse` chiude il periodo e ne apre uno nuovo (default: dallo stesso
   istante; opzione "Riparto da più tardi").
3. **Schermata di riflessione** — Titolo: **"Il percorso continua."** Testo: "Hai registrato una
   ricaduta oggi. I tuoi X giorni precedenti restano nel tuo storico, insieme alle milestone che
   hai raggiunto." Domanda: "Cosa pensi abbia contribuito?" (chip opzionali: stress, noia,
   solitudine, soldi disponibili, evento sportivo, pubblicità, alcol, conflitto, altro) + nota.
4. **Risorse** — card "Parlarne può aiutare" con TVNGA e link al Help Center (sempre presente,
   mai modale bloccante).
5. **Dashboard** — nuovo periodo; sezione "Il tuo percorso" mostra tempo totale e periodo più lungo.

Copy vietato: "fallito", "perso", "reset", "ricomincia da zero", colori `danger` sullo schermo.

## Flow 5 — Storico

Lista periodi (più recente in alto): date inizio–fine, durata, milestone raggiunte, stima
denaro, n. impulsi nel periodo; tap → dettaglio con ricadute (fattori, nota) e impulsi.
In testa: riepilogo (tempo totale, periodo più lungo, impulsi superati).
Empty state: "Il tuo storico crescerà con te. Qui troverai i tuoi periodi e i tuoi impulsi."

## Flow 6 — Obiettivi

Impostazioni → Obiettivi: lista milestone con toggle/elimina, "Aggiungi" (giorni o ore),
ripristina default. Validazione `normalizeMilestones`.

## Flow 7 — Impostazioni e privacy

Tema (Sistema/Chiaro/Scuro) · Notifiche · Denaro (attiva/disattiva, baseline) · Data di inizio
del periodo corrente (`editCurrentPeriodStart`) · Esporta dati (P1) · **Cancella tutti i dati**
(doppia conferma testuale: digitare "CANCELLA") → ritorno all'onboarding.

## Flow 8 — Errori e recovery

| Situazione                 | Comportamento                                                                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| DB non apribile / corrotto | Schermata "Non riusciamo a leggere i dati" con: Riprova · Esporta file grezzo (P1) · Ricomincia (con conferma). Mai cancellazione silenziosa. |
| Migrazione fallita         | Transazione annullata, app in modalità sola lettura + messaggio.                                                                              |
| Permesso notifiche negato  | Toggle torna su off; link alle impostazioni di sistema.                                                                                       |
| Link esterno non apribile  | Toast con numero copiabile.                                                                                                                   |
