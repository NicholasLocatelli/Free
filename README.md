# Free — compagno di percorso per smettere di giocare

> Nome dell'app: **Free**, scelto dall'owner (D-002 nel [decision log](docs/decisions/decision-log.md)).
> Prima della pubblicazione serve la verifica del marchio e del nome sugli store.

App mobile (Android + iOS) **privacy-first** per chi vuole ridurre o smettere un comportamento di
dipendenza. La prima categoria supportata è il **gioco d'azzardo**; il dominio è progettato per
aggiungere altre categorie senza riscrivere l'architettura.

L'app **non è una terapia** né un dispositivo medico: è uno strumento personale di monitoraggio,
consapevolezza e accesso rapido a risorse di aiuto ufficiali.

**Principio guida:** una ricaduta non cancella il percorso. Lo storico conserva sempre i progressi.

## Stato

| Milestone          | Stato                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------- |
| M0 — Discovery     | ✅ completata ([review](docs/reviews/MILESTONE-0-1-REVIEW.md))                              |
| M1 — Architecture  | ✅ completata — dominio `@free/core` implementato e testato                                 |
| M2 — Design System | 🟡 codice completo (#1, #2) — verifica accessibilità su dispositivo pendente                |
| M3 — MVP Core      | 🟡 codice completo (#3, #4) — prova su dispositivo pendente                                 |
| M4 — Tracking      | 🟡 codice completo (#5): SOS, impulsi, ricaduta, storico, impostazioni                      |
| M5 — Help Center   | 🟡 codice completo (#6); revisione professionale dei testi pendente                         |
| M6 — Testing       | 🟡 promemoria discreti fatti (#12); E2E in CI da fare                                       |
| M7 — Security      | 🟡 blocco app, cancellazione dati, export/import, nessun backup di sistema su Android (#13) |

Roadmap completa: [docs/product/roadmap.md](docs/product/roadmap.md).

## Struttura

```
apps/mobile/        App Expo SDK 57 (React Native) con design system in src/ui
packages/core/      Motore di dominio puro TypeScript: periodi, ricadute, impulsi,
                    milestone, stima denaro. Nessuna dipendenza da React/piattaforma.
docs/product/       Visione, principi, MVP, roadmap, competitor, help center, metriche
docs/ux/            Personas, user flow, IA, wireframe, design system
docs/architecture/  Overview, stack, ADR, modello dati, sicurezza
docs/testing/       Strategia e piano di test
docs/decisions/     Decision log
docs/reviews/       Review di fine milestone
docs/AGENTS.md      Organizzazione multi-agente, workflow, criteri di qualità
```

## Sviluppo

Requisiti: Node ≥ 22.12, pnpm 10 (`corepack enable`).

```bash
pnpm install
pnpm check      # format:check + lint + typecheck + test
pnpm test       # solo test
pnpm --filter @free/mobile start       # app in Expo Go
pnpm --filter @free/mobile start:dev   # app nella development build
```

Build installabile Android con EAS: [docs/release/eas-android.md](docs/release/eas-android.md).

## Documenti chiave

- [Product vision](docs/product/product-vision.md) · [Principi](docs/product/product-principles.md) · [MVP](docs/product/mvp.md)
- [Architettura](docs/architecture/overview.md) · [Stack (ADR-001)](docs/architecture/ADR-001-tech-stack.md) · [Modello dati](docs/architecture/data-model.md) · [Sicurezza](docs/architecture/security.md)
- [Design system](docs/ux/design-system.md) · [User flow](docs/ux/user-flows.md)
- [Strategia di test](docs/testing/test-strategy.md) · [Piano di test](docs/testing/test-plan.md)

## Se hai bisogno di aiuto adesso

In Italia: **Telefono Verde Nazionale per le problematiche legate al gioco d'azzardo — 800 558822**
(Istituto Superiore di Sanità, gratuito e anonimo, lun–ven 10–16). In emergenza: **112**.
Fonti e data di verifica (ultima: 2026-11-07) in [docs/product/help-center.md](docs/product/help-center.md).

## Licenza

Vedi [LICENSE](LICENSE). Contributi: [CONTRIBUTING.md](CONTRIBUTING.md). Sicurezza: [SECURITY.md](SECURITY.md).
