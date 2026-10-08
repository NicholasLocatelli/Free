# Free — compagno di percorso per smettere di giocare

> Nome in codice del repository: **Free**. Nome prodotto di lavoro: **Approdo** (da validare, vedi
> [decision log](docs/decisions/decision-log.md) D-002).

App mobile (Android + iOS) **privacy-first** per chi vuole ridurre o smettere un comportamento di
dipendenza. La prima categoria supportata è il **gioco d'azzardo**; il dominio è progettato per
aggiungere altre categorie senza riscrivere l'architettura.

L'app **non è una terapia** né un dispositivo medico: è uno strumento personale di monitoraggio,
consapevolezza e accesso rapido a risorse di aiuto ufficiali.

**Principio guida:** una ricaduta non cancella il percorso. Lo storico conserva sempre i progressi.

## Stato

| Milestone          | Stato                                                                        |
| ------------------ | ---------------------------------------------------------------------------- |
| M0 — Discovery     | ✅ completata ([review](docs/reviews/MILESTONE-0-1-REVIEW.md))               |
| M1 — Architecture  | ✅ completata — dominio `@free/core` implementato e testato                  |
| M2 — Design System | 🟡 codice completo (#1, #2) — verifica accessibilità su dispositivo pendente |
| M3 — MVP Core      | pianificata                                                                  |

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
```

## Documenti chiave

- [Product vision](docs/product/product-vision.md) · [Principi](docs/product/product-principles.md) · [MVP](docs/product/mvp.md)
- [Architettura](docs/architecture/overview.md) · [Stack (ADR-001)](docs/architecture/ADR-001-tech-stack.md) · [Modello dati](docs/architecture/data-model.md) · [Sicurezza](docs/architecture/security.md)
- [Design system](docs/ux/design-system.md) · [User flow](docs/ux/user-flows.md)
- [Strategia di test](docs/testing/test-strategy.md) · [Piano di test](docs/testing/test-plan.md)

## Se hai bisogno di aiuto adesso

In Italia: **Telefono Verde Nazionale per le problematiche legate al gioco d'azzardo — 800 558822**
(Istituto Superiore di Sanità, gratuito e anonimo, lun–ven 10–16). In emergenza: **112**.
Fonti e data di verifica in [docs/product/help-center.md](docs/product/help-center.md).

## Licenza

Vedi [LICENSE](LICENSE). Contributi: [CONTRIBUTING.md](CONTRIBUTING.md). Sicurezza: [SECURITY.md](SECURITY.md).
