# apps/mobile

App Expo (SDK 57, React Native 0.86, Expo Router) per Android e iOS.

La logica di dominio non vive qui: l'app consuma `@free/core` e si limita a UI, persistenza
(SQLite, issue #3), notifiche e integrazioni di piattaforma. Struttura in
`docs/architecture/overview.md`.

```
app/                 route Expo Router (sottili, solo composizione)
src/features/<name>/ schermate e logica di presentazione per feature
src/platform/        clock (useNow), in futuro notifiche, id, linking
src/ui/              design system (issue #2)
src/state/, src/data store Zustand e repository SQLite (issue #3)
```

## Comandi

```bash
pnpm --filter @free/mobile start      # Metro / Expo dev server
pnpm --filter @free/mobile test       # jest-expo + React Native Testing Library
pnpm --filter @free/mobile typecheck
pnpm --filter @free/mobile doctor     # verifica versioni compatibili con l'SDK
```

## Stato

Scaffold (issue #1): la schermata "Oggi" usa il dominio reale con un percorso in memoria creato
all'avvio. Onboarding e persistenza arrivano con #3/#4; tema e componenti con #2.
