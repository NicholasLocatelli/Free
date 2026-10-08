# ADR-001 — Tech stack

- **Stato:** Accettato
- **Data:** 2026-10-02
- **Decisori:** Lead Architect, Mobile Engineer, Security Engineer, Test Engineer; approvato dal Lead Orchestrator

## Contesto

Serve un'app Android + iOS, sviluppata da un team piccolo (agenti AI + owner), local-first, con
dominio testabile, dark mode, accessibilità, notifiche locali, e possibile backend futuro. Vincoli
di priorità: sicurezza utente > privacy > correttezza > valore > accessibilità > manutenibilità.

## Decisioni e alternative

### 1. Framework mobile: **Expo (React Native) + TypeScript**

| Alternativa                | Pro                                                                                                                                                            | Contro                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Expo / React Native** ✅ | Un codice per due piattaforme; TS end-to-end con il dominio; Expo Router; moduli ufficiali per SQLite, notifiche, secure store; EAS per build senza Mac locale | Dipendenza dall'ecosistema Expo; aggiornamenti SDK periodici                        |
| Flutter                    | Ottime performance e UI coerente                                                                                                                               | Dart: il dominio non condivisibile con eventuali tool/web TS; team già orientato TS |
| Nativo (Swift + Kotlin)    | Massimo controllo                                                                                                                                              | Doppio costo di sviluppo e test                                                     |

Versione: **SDK 57** (npm `latest` il 2026-10-02; SDK 58 solo `next`). Non si adottano versioni
`next` per un'app con dati sensibili.

### 2. Dominio separato: **`@free/core` TypeScript puro**

Funzioni pure `Journey → Result<Journey>`, nessuna dipendenza. Testabile in Node in millisecondi,
riusabile da un eventuale backend/web, impedisce che la logica di tempo/ricaduta finisca nei
componenti. Alternativa scartata: logica negli store/hook (difficile da testare e da rivedere).

### 3. Persistenza: **expo-sqlite con SQL esplicito**

| Alternativa          | Motivo                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **expo-sqlite** ✅   | Transazioni ACID (ricaduta = più scritture atomiche), vincoli (`CHECK`, indice parziale "un solo periodo aperto"), modulo ufficiale Expo, opzione di cifratura SQLCipher da valutare in M7 |
| AsyncStorage / MMKV  | Key-value: niente transazioni né vincoli; rischio di stati parziali                                                                                                                        |
| Drizzle ORM          | Valido, ma dipendenza in più per ~4 tabelle; rivalutabile se lo schema cresce                                                                                                              |
| WatermelonDB / Realm | Pensati per sync complessi; sovradimensionati per l'MVP                                                                                                                                    |

### 4. Stato: **Zustand** come cache del Journey

Store minimale; la verità è SQLite. Alternative: Redux Toolkit (più cerimonia), React Context
(re-render meno controllabili), TanStack Query (orientato a server state).

### 5. Backend: **nessuno nell'MVP**

Il core non ha bisogno di rete; ogni dato in uscita aumenta il rischio privacy. Account + backup
cifrato end-to-end (Supabase/PostgreSQL come candidato) verranno valutati con ADR dedicato (P2).

### 6. Testing

Vitest (dominio) · jest-expo + RNTL (componenti, è il preset supportato da Expo) · better-sqlite3
dietro interfaccia `SqlExecutor` per testare migrazioni e query in Node · Maestro per E2E
(Playwright non pilota app native; Detox richiede più configurazione nativa).

### 7. TypeScript 6.0 invece di 7.0

TS 7.0.2 è `latest`, ma `typescript-eslint` 8.71 dichiara `typescript <6.1`. Il lint type-aware è
un requisito di qualità: si fissa `~6.0.3` e si rivaluta a ogni release di typescript-eslint.

## Conseguenze

- ✅ Un'unica codebase TS; dominio verificato da test prima di qualsiasi UI.
- ✅ Nessun dato lascia il dispositivo nell'MVP.
- ⚠️ Cambio telefono = perdita dati finché non c'è export/import (P1) o backup E2EE (P2).
- ⚠️ Dipendenza dal ciclo di rilascio Expo: upgrade SDK pianificati (1 per trimestre max).
- 🔁 Da riconfermare in M2: compatibilità esatta delle versioni con `npx expo install --check`
  (documentazione expo.dev non raggiungibile dall'ambiente di build durante M1).
