# Test Strategy

_Owner: Team D (Test Engineer, UX Tester, Edge Case Tester, Release QA). 2026-10-02._

## Obiettivo

Garantire che **tempo, storico e ricadute siano sempre corretti** (un bug qui tradisce la fiducia
dell'utente nel momento più fragile) e che i flussi critici funzionino su Android e iOS.

## Piramide

| Livello            | Strumento                                                                            | Ambito                                                                       | Quando                          | Soglia                                      |
| ------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------- |
| Unit (dominio)     | Vitest                                                                               | `@free/core`: tempo, milestone, denaro, comandi, read model                  | Ogni push (CI)                  | Coverage righe ≥ 95% su core (gate da M3)   |
| Integration (dati) | Vitest/Jest + better-sqlite3 dietro `SqlExecutor`                                    | Migrazioni da ogni versione, repository, transazioni, vincoli, dati corrotti | Ogni push                       | Tutti i comandi coperti                     |
| Component          | jest-expo + React Native Testing Library                                             | Componenti design system, schermate con store reale e repository fake        | Ogni push                       | Stati: default, empty, error, loading, skew |
| E2E                | Maestro su build Android (CI) e iOS (pre-release)                                    | Flussi critici (test-plan.md)                                                | Nightly + prima di ogni release | 100% flussi critici verdi                   |
| Accessibilità      | Check automatici RNTL (ruoli/label) + verifica manuale VoiceOver/TalkBack, font 200% | Flussi critici                                                               | Fine milestone                  | Checklist design-system §8                  |
| UX review          | UX Tester con script dei flow                                                        | Onboarding, ricaduta, impulso                                                | Fine M3, M4, M5                 | Nessun copy vietato                         |
| Security           | Checklist security.md                                                                | Build release                                                                | M7 e ogni release               | Tutta la checklist                          |

## Principi

- **Tempo iniettato:** nessun test usa l'orologio reale; `now`/`Clock` sono parametri.
- **Dominio puro = test veloci e deterministici;** la UI non viene testata per logica che vive nel core.
- **Ogni bug → test di regressione** prima del fix.
- **No flaky:** un test instabile è un bug da correggere, mai da disabilitare.
- **Dati realistici e estremi** (anni di storico, migliaia di impulsi) per performance (M6).

## Gate CI

`pnpm check` = Prettier check · ESLint strict type-checked · `tsc` strict · test. La PR non si
unisce con CI rossa. Release QA blocca il rilascio con bug **blocker** aperti (vedi test-plan).
