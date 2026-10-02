# Tech Stack

_Versioni verificate sul registry npm il **2026-10-02**. La documentazione ufficiale di
expo.dev non era raggiungibile dall'ambiente di build: compatibilità finale confermata in M2 con
`npx expo install --check`. Motivazioni in [ADR-001](ADR-001-tech-stack.md)._

| Area                 | Scelta                                                                         | Versione                                               | Stato                                                                           |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Runtime/tooling      | Node.js                                                                        | ≥ 22.12 (CI: 22)                                       | ✅ in uso                                                                       |
| Package manager      | pnpm workspaces                                                                | 10.28                                                  | ✅ in uso                                                                       |
| Linguaggio           | TypeScript strict (+ `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | 6.0.x                                                  | ✅ in uso — 7.0 disponibile ma `typescript-eslint` 8.71 supporta `<6.1` (D-006) |
| Lint / format        | ESLint 10 + typescript-eslint `strictTypeChecked`; Prettier 3                  | 10.12 / 8.71 / 3.9                                     | ✅ in uso                                                                       |
| Test dominio         | Vitest                                                                         | 5.0                                                    | ✅ in uso                                                                       |
| Mobile framework     | Expo (React Native, New Architecture, Hermes)                                  | SDK 57 (`expo@57.0.x`, tag `latest`; SDK 58 in `next`) | M2                                                                              |
| Navigazione          | Expo Router                                                                    | 57.0.x                                                 | M2                                                                              |
| Stato UI             | Zustand                                                                        | 5.0.x                                                  | M3                                                                              |
| Persistenza          | expo-sqlite (SQL scritto a mano + migrazioni con `PRAGMA user_version`)        | 57.0.x                                                 | M3                                                                              |
| Notifiche            | expo-notifications (solo locali)                                               | 57.0.x                                                 | M6                                                                              |
| Secret su device     | expo-secure-store                                                              | 57.0.x                                                 | M7 (chiave DB se si adotta SQLCipher)                                           |
| Test componenti      | jest-expo + @testing-library/react-native                                      | 57.0.x / 14.0.x                                        | M2                                                                              |
| Test integrazione DB | better-sqlite3 in Node dietro la stessa interfaccia `SqlExecutor`              | —                                                      | M3                                                                              |
| E2E                  | Maestro (flow YAML su build Android/iOS)                                       | —                                                      | M6                                                                              |
| i18n                 | Dizionario tipizzato + `expo-localization` (solo `it` nell'MVP)                | —                                                      | M2                                                                              |
| Backend              | **Nessuno nell'MVP**. Valutato Supabase/PostgreSQL per backup E2EE (F16)       | —                                                      | P2                                                                              |
| CI                   | GitHub Actions                                                                 | —                                                      | ✅ in uso                                                                       |
| Build/distribuzione  | EAS Build/Submit (richiede account Expo — input umano)                         | —                                                      | M8                                                                              |
