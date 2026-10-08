# Data Model & State Model

_Owner: Lead Architect + Backend/Data Engineer. Implementazione di riferimento: `packages/core/src/types.ts`._

## Entità di dominio

```
Journey 1 ──── * Period        (cronologici; solo l'ultimo può essere aperto)
   │    1 ──── * RelapseEvent  (ognuno chiude esattamente un Period)
   │    1 ──── * UrgeEvent
   │    1 ──── 1 MoneySettings
   │    1 ──── * milestoneHours
   └── categoryId ──▶ RecoveryCategory (registry statico nel codice)
```

| Entità               | Campi                                                                                                                                          | Invarianti                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **RecoveryCategory** | id, nameKey, descriptionKey, icon, status (`available`/`planned`), defaultMilestoneHours, supportsMoneyEstimate, triggerTags, copingActionTags | Dato statico, versionato col codice. Solo `gambling` è `available`.                                      |
| **Journey**          | id, categoryId, createdAt, periods, relapses, urges, milestoneHours, money                                                                     | Un percorso attivo per categoria. Append-only rispetto agli eventi.                                      |
| **Period**           | id, startedAt, endedAt \| null, endReason (`relapse`) \| null                                                                                  | Al massimo un periodo aperto; `startedAt ≤ endedAt`; periodi non sovrapposti; nessun istante nel futuro. |
| **RelapseEvent**     | id, periodId, occurredAt, recordedAt, contributingFactors[], note                                                                              | `occurredAt ≥ period.startedAt`, ≤ now; nota ≤ 2000 caratteri; ≤ 10 tag.                                 |
| **UrgeEvent**        | id, occurredAt, recordedAt, intensity (1–10 int), trigger, durationMinutes (0–1440), copingActions[], outcome (`resisted`/`acted`), note       | Un urge `acted` **non** chiude il periodo da solo (decide l'utente).                                     |
| **MoneySettings**    | enabled, currency (ISO 4217), amountPerSessionMinor (int, centesimi), sessionsPerUnit, frequencyUnit (`day`/`week`/`month`)                    | Se `enabled`, baseline completa; importi interi, max 10.000.000,00.                                      |

**Dati derivati (mai salvati):** durata periodi, milestone raggiunte, tempo totale, periodo più
lungo, stima denaro, impulsi superati. Derivarli garantisce che una ricaduta non possa
cancellarli e che non esistano incoerenze tra dati e statistiche.

**Tempo:** tutti gli istanti sono epoch ms UTC (`Instant`). `recordedAt` ≠ `occurredAt` consente
registrazioni a posteriori.

## Schema SQLite (implementato in #3)

Codice: `apps/mobile/src/data/` — `migrations.ts` (schema), `rows.ts` (mapping e validazione in
lettura), `JourneyRepository.ts` (salvataggio per differenza in una transazione),
`SettingsRepository.ts`, `expoSqlExecutor.ts` (device) e `src/test/nodeSqlExecutor.ts` (test).

```sql
-- PRAGMA user_version = 1
CREATE TABLE journeys (
  id                       TEXT PRIMARY KEY,
  category_id              TEXT NOT NULL,
  created_at               INTEGER NOT NULL,
  milestone_hours          TEXT NOT NULL,              -- JSON array di interi ordinati
  money_enabled            INTEGER NOT NULL DEFAULT 0 CHECK (money_enabled IN (0, 1)),
  money_currency           TEXT NOT NULL DEFAULT 'EUR',
  money_amount_minor       INTEGER,
  money_sessions_per_unit  REAL,
  money_frequency_unit     TEXT NOT NULL DEFAULT 'week' CHECK (money_frequency_unit IN ('day','week','month'))
);

CREATE TABLE periods (
  id          TEXT PRIMARY KEY,
  journey_id  TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  started_at  INTEGER NOT NULL,
  ended_at    INTEGER,
  end_reason  TEXT CHECK (end_reason IN ('relapse')),
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);
CREATE UNIQUE INDEX one_open_period_per_journey ON periods(journey_id) WHERE ended_at IS NULL;
CREATE INDEX periods_by_journey ON periods(journey_id, started_at);

CREATE TABLE relapses (
  id                   TEXT PRIMARY KEY,
  journey_id           TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  period_id            TEXT NOT NULL REFERENCES periods(id),
  occurred_at          INTEGER NOT NULL,
  recorded_at          INTEGER NOT NULL,
  contributing_factors TEXT NOT NULL DEFAULT '[]',      -- JSON array
  note                 TEXT
);

CREATE TABLE urges (
  id                TEXT PRIMARY KEY,
  journey_id        TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  occurred_at       INTEGER NOT NULL,
  recorded_at       INTEGER NOT NULL,
  intensity         INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 10),
  trigger_tag       TEXT,
  duration_minutes  INTEGER CHECK (duration_minutes BETWEEN 0 AND 1440),
  coping_actions    TEXT NOT NULL DEFAULT '[]',
  outcome           TEXT NOT NULL CHECK (outcome IN ('resisted','acted')),
  note              TEXT
);
CREATE INDEX urges_by_journey ON urges(journey_id, occurred_at);

CREATE TABLE app_settings (            -- preferenze non sensibili
  key   TEXT PRIMARY KEY,              -- 'theme', 'onboarding_step', 'notifications', ...
  value TEXT NOT NULL
);
```

- `PRAGMA foreign_keys = ON` e `journal_mode = WAL` all'apertura.
- Ogni comando di dominio = **una transazione**. Il repository salva la differenza tra lo stato
  persistito e il nuovo `Journey`: aggiorna i periodi modificati **prima** di inserire quelli nuovi
  (così l'indice parziale "un solo periodo aperto" non vede mai due righe aperte), poi inserisce
  ricadute e impulsi nuovi. Gli eventi non vengono mai aggiornati né cancellati.
- I comandi dello store sono serializzati: ognuno parte dallo stato confermato dal precedente.
- Migrazioni: array ordinato di script, applicati in transazione aggiornando `user_version`;
  testate in Node (`node:sqlite`): rollback di una migrazione fallita, rifiuto di uno schema più
  recente dell'app (`SchemaTooNewError`).
- Mapping riga ⇄ entità: funzioni pure nel repository, testate; i JSON vengono validati in lettura
  (dati corrotti → errore esplicito, Flow 8).

## State model (app)

```
AppState
├── boot: 'loading' | 'ready' | 'error'          (apertura DB + migrazioni)
├── journey: Journey | null                      (null ⇒ onboarding)
├── onboarding: { step, draft }                  (persistito in app_settings)
├── preferences: { theme: 'system'|'light'|'dark', notifications: {...} }
└── now: Instant                                 (aggiornato dal tick di 60 s e su AppState active)

Selettori puri: currentPeriodView(journey, now), journeyStats(journey, now)
Azioni: dispatch(command) → core → repository (tx) → set
```

Macchina a stati di alto livello:

```
[loading] ──ok──▶ journey? ──no──▶ [onboarding] ──createJourney──▶ [active]
    │                    └──yes────────────────────────────────▶ [active]
    └──error──▶ [error] ──retry──▶ [loading]
[active] ──recordRelapse──▶ [active] (nuovo periodo)    [active] ──deleteAllData──▶ [onboarding]
```
