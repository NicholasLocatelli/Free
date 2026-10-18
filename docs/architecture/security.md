# Security & Privacy Model

_Owner: Security Engineer. Review obbligatoria prima di Beta (M7). 2026-10-02._

## Classificazione dei dati

| Dato                                      | Sensibilità                                                                                                    | Dove vive                    |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Periodi, ricadute, impulsi, note, trigger | **Molto alta** (dati relativi alla salute / comportamenti di dipendenza; categoria particolare ex art. 9 GDPR) | Solo SQLite sul dispositivo  |
| Baseline denaro                           | Alta                                                                                                           | Solo dispositivo             |
| Preferenze (tema, notifiche)              | Bassa                                                                                                          | Solo dispositivo             |
| Analytics                                 | —                                                                                                              | **Nessuno** nell'MVP (D-010) |

## Principi

1. **Local-first, zero rete per il core.** L'MVP non effettua richieste di rete; nessun SDK di
   terze parti che trasmetta dati (analytics, ads, crash reporting) senza security review e opt-in.
2. **Minimizzazione.** Nessun nome, email, telefono, posizione, contatti. Nessun account.
3. **Controllo dell'utente.** Cancellazione totale in-app (DB + secure store + notifiche
   pianificate + preferenze); export (P1) in JSON leggibile.
4. **Discrezione.** Notifiche con testo neutro; contenuto sensibile mai sulla lock screen; nome e
   icona dell'app non rivelano il tema; schermate sensibili nascoste nello switcher app (V1).

## Account e anonimato (analisi 2026-10-18)

Stato attuale: **nessuna registrazione**. Non esistono account, email, numeri di telefono o
identificativi; l'app non comunica con server. Chi la usa è anonimo per costruzione.

| Opzione                                    | Vantaggi                                                                                                   | Costi e rischi                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nessun account** (attuale, D-004)        | Anonimato totale; nessun server da attaccare; nessun obbligo di titolare del trattamento sui dati sanitari | Cambio o perdita del telefono = perdita dei dati, finché non c'è l'export (#13)                                                                                                                                                                                                                                                                                   |
| Account con dati sul server                | Backup e più dispositivi                                                                                   | Lega una persona identificabile a un comportamento di dipendenza: dato di **categoria particolare** (art. 9 GDPR) → base giuridica esplicita, privacy policy, misure di sicurezza, gestione e notifica delle violazioni, costi infrastrutturali; impatto grave di un data breach (stigma, ricatto, lavoro, famiglia); barriera d'ingresso per chi teme di esporsi |
| Backup facoltativo cifrato end-to-end (P2) | Cambio telefono senza esporre contenuti                                                                    | Il server vede solo dati cifrati con una chiave che solo l'utente possiede; resta il metadato "questa persona usa l'app"; complessità di recupero se si perde la chiave                                                                                                                                                                                           |

**Raccomandazione:** restare senza account; aggiungere export/import su file controllato
dall'utente (#13); valutare il backup E2EE solo se la domanda reale lo giustifica, con un ADR
dedicato.

## Notifiche (implementate in #12)

- Solo **locali** (expo-notifications): nessun server push, nessun token del dispositivo.
- Spente di default; il permesso di sistema viene chiesto solo quando l'utente attiva un promemoria.
- Testi neutri e fissi ("Un momento per te?", "Hai un nuovo traguardo."), verificati da un test che
  vieta parole come gioco, azzardo, denaro, ricaduta, impulso.
- Android: canale "Promemoria" con visibilità **privata** sulla schermata di blocco sicura.
- Ogni modifica ripianifica da zero (cancella tutto e riprogramma): niente duplicati né promemoria
  di periodi chiusi.

## Threat model (STRIDE semplificato)

| Minaccia                             | Scenario                           | Mitigazione                                                                                                                                                                                                                     |
| ------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accesso fisico al telefono sbloccato | Partner/collega apre l'app         | Blocco app con biometria/PIN (P1, F13); nome/icona discreti                                                                                                                                                                     |
| Shoulder surfing / lock screen       | Notifica esplicita visibile        | ✅ Testi neutri verificati da test; Android visibilità privata (#12)                                                                                                                                                            |
| Furto del dispositivo bloccato       | Estrazione file                    | Cifratura a riposo dell'OS (iOS Data Protection, Android FBE); valutazione SQLCipher con chiave in secure store (M7)                                                                                                            |
| Backup cloud del sistema             | DB copiato in iCloud/Google backup | Default: escludere il DB dai backup automatici (Android `allowBackup`/regole di backup, iOS `isExcludedFromBackup`) — trade-off: perdita dati al cambio telefono, mitigata da export (P1). Decisione D-014 da confermare in M7. |
| Log e crash                          | Note/trigger finiscono nei log     | Nessun log di contenuti utente; regola di review; nessun crash reporter remoto nell'MVP                                                                                                                                         |
| Supply chain                         | Dipendenza compromessa             | Lockfile, CI con `--frozen-lockfile`, dipendenze minime, aggiornamenti revisionati, Dependabot/Renovate (M7)                                                                                                                    |
| Secret nel repo                      | Chiavi EAS/store                   | Nessun secret nel codice; `.gitignore` per chiavi; secret solo in GitHub/EAS secrets                                                                                                                                            |
| Deep link malevoli                   | Link che inducono azioni           | Nessuna azione distruttiva via deep link; solo navigazione                                                                                                                                                                      |
| Link esterni                         | URL manomessi nel contenuto        | Risorse in file versionato e revisionato; solo HTTPS, domini istituzionali                                                                                                                                                      |

## Requisiti verificabili (checklist M7)

- [ ] Nessuna richiesta di rete nell'MVP (verifica con proxy durante QA)
- [ ] Permessi richiesti: solo notifiche (opzionale). Nessun permesso di posizione/contatti/rete extra
- [ ] Cancellazione dati: dopo "Cancella tutto" il DB non esiste più e l'app torna all'onboarding
- [x] Notifiche: nessun riferimento al gioco nel testo (test `reminderPlan.test.ts`)
- [ ] Nessun dato utente in console/log nelle build release
- [ ] Policy backup decisa e implementata (D-014)
- [ ] Privacy policy e dichiarazioni store (Apple Privacy Nutrition Label, Google Data Safety): "nessun dato raccolto"
- [ ] Revisione dipendenze e licenze

## Futuro: account e sync (P2)

Solo con ADR dedicato. Requisiti minimi: opzionale; cifratura **end-to-end** lato client (il
server non può leggere i dati); cancellazione account ed export; spiegazione chiara del perché.
