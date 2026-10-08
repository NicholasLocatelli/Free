# Obiettivi e motivazione

_Owner: A3 Goal / Motivation Agent. Review: UX, Accessibility. 2026-10-02._

## Principi

- Motivazione orientata al **miglioramento**, mai alla vergogna.
- Il progresso ha **più dimensioni**: serie corrente, tempo totale, impulsi superati, denaro stimato.
  Una ricaduta azzera solo la serie corrente; le altre continuano a crescere o restano.
- Celebrazioni **sobrie**: un messaggio caldo e un'icona, nessun effetto "jackpot".

## Modello

| Dimensione               | Definizione (implementata in `@free/core`)                       | Si azzera dopo ricaduta?                                   |
| ------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Periodo corrente         | Tempo dall'inizio del periodo aperto (`currentPeriodView`)       | Inizia un nuovo periodo; il precedente resta nello storico |
| Tempo totale             | Somma di tutti i periodi (`journeyStats.totalTimeMs`)            | **No**                                                     |
| Periodo più lungo        | `journeyStats.longestPeriodMs`                                   | **No**                                                     |
| Milestone raggiunte      | Derivate dai periodi (`achievedMilestones`), mai cancellate      | **No**                                                     |
| Impulsi superati         | Urge con esito `resisted`                                        | **No**                                                     |
| Denaro non speso (stima) | Baseline × tempo (`estimateMoneyNotSpent`), per periodo e totale | Il totale **no**                                           |

## Milestone

Default (valutati e mantenuti dal Product Team): **24h, 3, 7, 14, 30, 60, 90, 180, 365 giorni**.

Motivazione: primi traguardi ravvicinati per rinforzo precoce; poi cadenza crescente. Dopo 365
giorni il sistema mostra "anniversari" annuali (V1). Le milestone sono **configurabili** (aggiungi/
rimuovi, valori in ore, max 50, validazione in `normalizeMilestones`).

"Giorno" = 24 ore complete dall'istante di inizio (D-007): chi inizia alle 22:00 raggiunge "1
giorno" alle 22:00 del giorno dopo, indipendentemente da timezone o ora legale.

## Obiettivi giornalieri e settimanali (V1, F15)

Obiettivi di **processo**, non di risultato, scelti dall'utente tra pochi suggerimenti:
"Registro come sto oggi", "Uso una tecnica quando arriva un impulso", "Parlo con qualcuno di fiducia".
Mai obiettivi del tipo "non giocare oggi" con penalità.

## Messaggi motivazionali — linee guida

| ✅ Sì                                                           | ❌ No                     |
| --------------------------------------------------------------- | ------------------------- |
| "Il tuo percorso continua."                                     | "Hai fallito."            |
| "Hai superato 12 impulsi finora."                               | "Hai perso la tua serie!" |
| "Il tuo tempo totale: 47 giorni."                               | "Ricomincia da zero."     |
| "Hai raggiunto 7 giorni. Prenditi un momento per riconoscerlo." | "JACKPOT! 🎰"             |
| "Stima del denaro non speso"                                    | "Hai guadagnato 500 €"    |

Nessun messaggio promette risultati terapeutici ("guarirai", "sei libero per sempre").

## Dopo una ricaduta

1. Conferma (con scelta dell'orario) → 2. salvataggio → 3. chiusura del periodo → 4. nuovo periodo
   → 5. riflessione ("Cosa pensi abbia contribuito?" con tag opzionali) → 6. risorse di supporto
   (sempre visibili, mai forzate) → 7. nota opzionale. Copy di riferimento in
   [`docs/ux/user-flows.md`](../ux/user-flows.md#flow-4--registrare-una-ricaduta).

Se l'utente registra **più ricadute in poco tempo** (es. ≥ 3 in 7 giorni, soglia da validare con
UX/esperti), la schermata di riflessione dà più risalto alle risorse professionali, senza
allarmismi (V1, issue dedicata).
