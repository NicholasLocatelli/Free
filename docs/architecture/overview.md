# Architecture Overview

_Owner: Lead Architect. Review: Security, QA. 2026-10-02._

## Obiettivi architetturali

1. **Correttezza del tempo e dello storico** (sorgente di verità unica, append-only).
2. **Privacy by design**: local-first, nessuna rete necessaria per il core.
3. **Dominio indipendente dalla categoria** e dalla piattaforma.
4. **Semplicità**: la soluzione più semplice che soddisfa il requisito; niente backend finché non
   serve (D-004).

## Vista a strati

```
┌────────────────────────────────────────────────────────────┐
│ apps/mobile (Expo + React Native)                          │
│                                                            │
│  app/  (Expo Router: route sottili, solo composizione)     │
│    │                                                       │
│  src/features/<feature>/   schermate + hook di feature     │
│    │        │                                              │
│  src/ui/  design system (componenti presentazionali)       │
│    │                                                       │
│  src/state/  store Zustand = cache in memoria del Journey  │
│    │   dispatch(command) ──▶ @free/core (valida, calcola)  │
│    │                     ──▶ src/data (persiste in tx)     │
│  src/data/   repository SQLite (expo-sqlite) + migrazioni  │
│  src/platform/ notifiche locali, clock, id, linking        │
└───────────────┬────────────────────────────────────────────┘
                │ import (solo funzioni pure e tipi)
┌───────────────▼────────────────────────────────────────────┐
│ packages/core  (@free/core) — TypeScript puro, 0 dipendenze│
│  time · categories · journey (comandi) · milestones ·      │
│  money · summary (read model) · result                     │
└────────────────────────────────────────────────────────────┘
```

Regole di dipendenza (verificate in review, lint rule in M2): `core` non importa nulla dall'app;
`ui` non importa `data`/`state`; le route non contengono logica.

## Flusso di un comando (es. "Registra ricaduta")

```
UI (form, id generato all'apertura)
  → store.dispatch(recordRelapse, input + now=clock.now())
     → core.recordRelapse(journey, input)   // validazione + nuovo Journey, puro
        ├─ error → UI mostra messaggio, nulla persistito
        └─ ok    → repository.applyRelapse(...) in UNA transazione SQLite
                     ├─ fallisce → store invariato, ErrorState
                     └─ ok       → store.set(newJourney) → UI si aggiorna
```

Persistenza prima dello stato in memoria: la UI non mostra mai qualcosa che non è salvato.

## Timer: sorgente di verità

- Si salva solo l'**istante UTC di inizio** del periodo (`startedAt`, epoch ms).
- Il valore mostrato è sempre `now − startedAt` calcolato a ogni render/tick (`currentPeriodView`).
- Tick UI ogni 60 s (il timer mostra minuti) + ricalcolo su `AppState` → `active`. Nessun timer in
  background, nessun contatore incrementale: riavvio, kill, background, reboot e cambio timezone
  non possono "perdere" tempo.
- Cambio ora legale/timezone: irrilevante per la durata; influisce solo sulla formattazione della
  data di inizio (mostrata nel fuso corrente con `Intl.DateTimeFormat`).
- Orologio spostato indietro: `clockSkew = true`, durata clamp a 0, banner informativo, nessuna
  scrittura (D-007).

## Estensione a nuove categorie

Aggiungere una categoria = aggiungere un record al registry `CATEGORIES` (milestone default,
trigger, azioni, supporto stima denaro) + contenuti Help Center + chiavi i18n. Nessun `if
(category === 'gambling')` nel codice (regola di review).

## Struttura del repository

```
apps/mobile/            (M2) Expo app
packages/core/          dominio puro + test Vitest
docs/…                  documentazione viva
.github/workflows/ci.yml  format · lint · typecheck · test
```

Deviazione dal brief: `packages/ui`, `packages/config`, `packages/types` **non** vengono creati
ora. I tipi vivono in `@free/core`; la config condivisa è alla radice (`tsconfig.base.json`,
`eslint.config.mjs`); il design system nasce in `apps/mobile/src/ui` e verrà estratto in
`packages/ui` solo quando esisterà un secondo consumatore (D-005).

## Documenti

[Tech stack](tech-stack.md) · [ADR-001](ADR-001-tech-stack.md) · [Data model](data-model.md) ·
[Security](security.md)
