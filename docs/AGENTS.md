# Agents — organizzazione, workflow e criteri di qualità

Il progetto è sviluppato da un'organizzazione di agenti AI specializzati coordinati da un
**Lead AI Engineering Orchestrator**, che è responsabile del risultato finale.

## Team e ruoli

| Team                | Agente             | Responsabilità principali                                                                                                  | Documenti posseduti                                  |
| ------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **A — Product**     | A1 App Ideas       | Problema utente, feature (problema/target/valore/complessità/rischio/priorità/dipendenze), MVP vs V1 vs futuro, competitor | `product/mvp.md`, `product/competitive-analysis.md`  |
|                     | A2 Style/Brand     | Naming, identità, palette, tipografia, iconografia, tono, microcopy                                                        | `ux/design-system.md` §1–3, 6                        |
|                     | A3 Goal/Motivation | Milestone, obiettivi, messaggi, gestione motivazionale della ricaduta                                                      | `product/goals-and-motivation.md`                    |
|                     | A4 Help Center     | Contenuti di aiuto, risorse ufficiali verificate (fonte + data)                                                            | `product/help-center.md`                             |
| **B — UI/UX**       | UX Research        | Personas, journey, momenti di impulso, friction                                                                            | `ux/personas.md`                                     |
|                     | UX Architect       | IA, navigazione, flow, stati (empty/error/recovery)                                                                        | `ux/user-flows.md`, `ux/information-architecture.md` |
|                     | UI Designer        | Componenti, layout, dark mode, wireframe                                                                                   | `ux/wireframes.md`, `ux/design-system.md` §4–5, 7    |
|                     | Accessibility      | Contrasto, touch target, screen reader, font scaling, movimento, accessibilità cognitiva                                   | `ux/design-system.md` §8                             |
| **C — Engineering** | Lead Architect     | Architettura, struttura, decisioni tecnologiche, separation of concerns                                                    | `architecture/*`, ADR                                |
|                     | Mobile Engineer    | App Expo, navigazione, UI, stato, persistenza, notifiche                                                                   | `apps/mobile`                                        |
|                     | Backend Engineer   | API/sync/account quando necessari (non nell'MVP)                                                                           | ADR futuri                                           |
|                     | Data/Analytics     | Metriche privacy-safe, eventi documentati prima dell'implementazione                                                       | `product/metrics.md`                                 |
|                     | Security           | Dati personali, storage, secrets, logging, privacy                                                                         | `architecture/security.md`, `SECURITY.md`            |
| **D — QA**          | Test Engineer      | Unit, integration, E2E, regression                                                                                         | `testing/test-strategy.md`                           |
|                     | UX Tester          | Comprensione, onboarding, ricaduta, impulsi                                                                                | review di fine milestone                             |
|                     | Edge Case Tester   | Tempo, dati mancanti/corrotti, valori estremi, doppio tap…                                                                 | `testing/test-plan.md` §2                            |
|                     | Release QA         | Blocca il rilascio con bug bloccanti o regressioni                                                                         | `testing/test-plan.md` §3                            |

## Workflow

```
PRODUCT → IDEATION REVIEW → UX RESEARCH → UX ARCHITECTURE → UI DESIGN → TECH ARCHITECTURE REVIEW
→ IMPLEMENTATION → AUTOMATED TESTING → UX REVIEW → SECURITY REVIEW → BUG FIX → FINAL QA
```

- **Revisione reciproca:** ogni team può contestare il lavoro di un altro. Il conflitto si risolve
  così: il team che solleva il problema lo documenta → il team proprietario rivaluta → Engineering
  stima il costo → il Lead Orchestrator decide e registra la decisione nel
  [decision log](decisions/decision-log.md).
- **Priorità decisionale:** 1 sicurezza utente · 2 privacy · 3 correttezza · 4 valore per
  l'utente · 5 accessibilità · 6 manutenibilità · 7 performance · 8 velocità · 9 polish visivo.
- **Lavoro verticale per milestone**; ogni milestone produce qualcosa di funzionante.
- **Fine milestone:** Product, UX, Engineering, Security, QA e Tech-debt review →
  `docs/reviews/MILESTONE-X-REVIEW.md`.

## Domande guida del Lead Orchestrator

- Feature: _"Rende davvero migliore il prodotto per l'utente?"_
- Soluzione tecnica: _"È la più semplice che soddisfa il requisito?"_
- Bug: _"È isolato o rivela un problema architetturale?"_

## Convenzioni

- **Lingua:** documentazione e copy in italiano; codice, identificatori, commenti e commit in
  inglese (D-003).
- **Branch:** `main`, `develop`, `feature/*`, `fix/*`, `refactor/*`, `claude/*` (CONTRIBUTING.md).
- **Issue:** obiettivo, contesto, acceptance criteria, dipendenze, definition of done; assegnate a
  una milestone M0–M8.
- **Fonti esterne:** solo ufficiali/istituzionali; URL + data di verifica nel documento. Mai
  inventare numeri, servizi, informazioni sanitarie o versioni di librerie.
- **Input umano** solo per: credenziali/API key, decisioni di business non deducibili, costi,
  accesso a servizi esterni, pubblicazione sugli store.

## Criteri di qualità del codice

TypeScript strict (no `any` non motivato) · lint e format puliti · nessun codice morto · logica
di dominio in `@free/core` con test · componenti piccoli · nessun magic number · errori gestiti
esplicitamente (`Result`) · nessun dato sensibile in log.

## Definition of Done

Una feature è terminata solo quando: Product ha validato il comportamento · UX ha validato il
flow · implementata · test presenti e verdi · lint e typecheck verdi · QA ha verificato gli edge
case · documentazione aggiornata · security concern risolti.
