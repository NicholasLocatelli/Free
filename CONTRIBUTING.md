# Contribuire

## Branch strategy

| Branch       | Uso                                                    |
| ------------ | ------------------------------------------------------ |
| `main`       | Sempre rilasciabile. Solo merge via PR con CI verde.   |
| `develop`    | Integrazione delle feature della milestone in corso.   |
| `feature/*`  | Nuove funzionalità (`feature/m3-dashboard`).           |
| `fix/*`      | Correzioni (`fix/timer-clock-skew`).                   |
| `refactor/*` | Refactoring senza cambi di comportamento.              |
| `claude/*`   | Branch di lavoro degli agenti AI; confluiscono via PR. |

Nessuna modifica significativa direttamente su `main`.

## Commit

Messaggi chiari all'imperativo, preferibilmente in stile Conventional Commits
(`feat(core): record urge outcome`, `fix(timer): clamp negative elapsed time`, `docs: …`).

## Prima di aprire una PR

```bash
pnpm check
```

Deve passare: Prettier, ESLint (typescript-eslint `strictTypeChecked`), `tsc` strict, Vitest.

## Regole di codice

- TypeScript strict; `any` vietato salvo motivazione scritta nel codice.
- La logica di dominio sta in `packages/core` (funzioni pure, testate). La UI non calcola tempi,
  milestone o stime.
- Niente magic number: costanti nominate.
- Errori come `Result` tipizzati nel dominio; nessuna eccezione per input utente non valido.
- Ogni feature importante ha test unit + integration; i flussi critici hanno E2E (da M3).
- Copy UI: tono non giudicante, nessuna promessa terapeutica (vedi `docs/ux/design-system.md`).
- Nessun dato personale nei log, negli analytics o nei crash report.

## Definition of Done

Vedi `docs/AGENTS.md` § Definition of Done.
