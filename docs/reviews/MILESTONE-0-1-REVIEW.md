# Review — M0 Discovery + M1 Architecture

_Data: 2026-10-02. Partecipanti: Product, UX, Engineering, Security, QA, Lead Orchestrator._

## What works

- Problema, utenti, MVP e principi definiti e coerenti tra loro (vision ↔ principi ↔ MVP ↔ flow).
- Principio "una ricaduta non cancella il percorso" reso **architetturale**: storico append-only,
  milestone e statistiche derivate (non cancellabili), verificato da test.
- `@free/core` implementato: tempo, categorie, comandi (createJourney, recordRelapse, recordUrge,
  editCurrentPeriodStart, settings), milestone, stima denaro, read model — **69 test verdi**,
  lint `strictTypeChecked` e `tsc` strict puliti.
- CI GitHub Actions (format, lint, typecheck, test).
- Help Center con risorse ufficiali italiane, fonte e data di verifica.
- Design system con contrasti calcolati (tutti i testi ≥ 4.5:1 in light e dark).

## Problems

- La documentazione ufficiale expo.dev e il sito iss.it non erano raggiungibili dall'ambiente di
  build: versioni verificate via registry npm, risorse via indice di ricerca → **ri-verifica
  obbligatoria** (M2 per Expo, M5 per risorse).
- Le personas sono proto-personas non validate con utenti reali.

## Risks

| Rischio                                        | Impatto                 | Mitigazione                                                                                                    |
| ---------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| Risorse d'aiuto errate o obsolete              | Alto (sicurezza utente) | Gate M5: ri-verifica sulla fonte + revisione professionale; data di verifica visibile in app                   |
| Tono percepito come giudicante                 | Alto                    | Microcopy di riferimento, UX review su REL-7, test sui testi vietati                                           |
| Perdita dati (cambio telefono, DB corrotto)    | Alto                    | Transazioni, ErrorState senza cancellazioni silenziose, export P1, D-014                                       |
| Esposizione involontaria (notifiche, nome app) | Alto                    | Testi neutri, nome discreto, blocco app P1                                                                     |
| Incompatibilità versioni Expo SDK 57           | Medio                   | `npx expo install --check` in M2                                                                               |
| Scope creep (community, AI, blocker)           | Medio                   | Feature scartate documentate in mvp.md                                                                         |
| Posizionamento regolatorio (app "salute")      | Medio                   | Nessuna funzione diagnostica/terapeutica; copy controllato; valutazione legale prima degli store (input umano) |

## Technical debt

- Nessuna soglia di coverage ancora applicata in CI (introdotta in M3 con `@vitest/coverage-v8`).
- Regole di dipendenza tra layer non ancora imposte da lint (M2).
- TypeScript fermo a 6.0 per compatibilità typescript-eslint (D-006).

## UX issues

- Da validare il numero di step dell'onboarding (6) con test d'uso.
- Definire la soglia "ricadute ravvicinate" per enfatizzare le risorse professionali (V1).

## Security issues

- Nessuno aperto sul codice attuale (nessuna I/O). Decisioni aperte: D-014 backup, SQLCipher (M7).

## Next actions

1. **M2 — Design System** (pronta, vedi issue): scaffold Expo SDK 57 in `apps/mobile`, token
   tema light/dark/system, componenti base con test, catalogo componenti, i18n `it`.
2. M3: repository SQLite + migrazioni + test di integrazione; onboarding; dashboard con timer.
3. Decisioni umane richieste: nome prodotto (D-002), licenza (D-012), modello di business (D-013).
