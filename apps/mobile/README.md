# apps/mobile

App Expo (React Native) per Android e iOS. Viene inizializzata nella milestone **M2 — Design System**
(issue "Scaffold app Expo"), seguendo `docs/architecture/overview.md` e `docs/architecture/tech-stack.md`.

La logica di dominio non vive qui: l'app consuma `@free/core` e si limita a UI, persistenza
(SQLite), notifiche e integrazioni di piattaforma.
