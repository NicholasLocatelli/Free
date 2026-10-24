# Decision Log

Formato: Decision · Context · Alternatives · Chosen approach · Reason · Trade-offs · Date.
Stato: ✅ decisa · ⏳ aperta (richiede input umano o milestone futura).

---

### D-001 ✅ Usare il repository esistente `nicholaslocatelli/free`

- **Context:** il brief chiede di creare una repo se non esiste. La sessione ha accesso a `free` (vuota, "Anti Gambling").
- **Alternatives:** nuova repo con nome di prodotto.
- **Chosen:** usare `free` come source of truth.
- **Reason:** è la repo dedicata indicata dall'owner; evitare frammentazione.
- **Trade-offs:** il nome repo non coincide col nome prodotto (irrilevante per l'utente finale).
- **Date:** 2026-10-02

### D-002 ⏳ Nome prodotto di lavoro "Approdo"

- **Context:** serve un nome discreto, italiano, non associato al gioco.
- **Alternatives:** Free (generico, conflitto con marchi telco), Riva, Varco.
- **Chosen:** "Approdo" come nome di lavoro.
- **Reason:** evoca arrivo/sicurezza, tono calmo, nessun riferimento al gioco.
- **Trade-offs:** **verifica marchio e disponibilità store necessaria (input umano) prima della Beta.**
- **Date:** 2026-10-02

### D-003 ✅ Lingua: docs/copy in italiano, codice in inglese

- **Context:** owner e mercato iniziale italiani; codice destinato a crescere.
- **Alternatives:** tutto in inglese; tutto in italiano.
- **Chosen:** docs e UI in italiano, codice/commit in inglese.
- **Reason:** massima chiarezza per owner e utenti; convenzioni standard per il codice.
- **Trade-offs:** contributori non italofoni dovranno tradurre i docs.
- **Date:** 2026-10-02

### D-004 ✅ MVP local-first senza backend né account

- **Context:** dati altamente sensibili; il core non richiede rete.
- **Alternatives:** Supabase con account opzionale fin dall'MVP.
- **Chosen:** solo dati locali; account/backup E2EE valutati in P2.
- **Reason:** priorità privacy (2) e semplicità; nessun costo infrastrutturale.
- **Trade-offs:** cambio telefono senza export = perdita dati; mitigazione: export (P1).
- **Date:** 2026-10-02

### D-005 ✅ Non creare `packages/ui`, `packages/types`, `packages/config` ora

- **Context:** il brief propone questi package come esempio.
- **Alternatives:** crearli vuoti subito.
- **Chosen:** tipi in `@free/core`, config alla radice, UI in `apps/mobile/src/ui`.
- **Reason:** niente struttura senza consumatori (no dead code); estrazione quando serve.
- **Trade-offs:** futura estrazione di `packages/ui` richiederà un refactor contenuto.
- **Date:** 2026-10-02

### D-006 ✅ TypeScript 6.0 invece di 7.0

- **Context:** TS 7.0.2 è `latest`; typescript-eslint 8.71 supporta `typescript <6.1`.
- **Alternatives:** TS 7 senza lint type-aware; TS 7 con lint non supportato.
- **Chosen:** `typescript ~6.0.3`.
- **Reason:** il lint type-aware strict è un requisito di qualità.
- **Trade-offs:** compilatore più lento di TS 7; rivalutare a ogni release di typescript-eslint.
- **Date:** 2026-10-02

### D-007 ✅ Modello del tempo: istanti UTC, "giorno" = 24 ore complete, clock skew clampato

- **Context:** il timer deve resistere a timezone, DST, riavvii, cambi d'ora.
- **Alternatives:** giorni di calendario nel fuso locale; contatore incrementale.
- **Chosen:** epoch ms UTC salvati; durata = now − start; giorni = blocchi di 24h; se now < start → 0 + flag `clockSkew`.
- **Reason:** unica definizione non ambigua e indipendente dal fuso; nessuno stato da sincronizzare.
- **Trade-offs:** chi inizia alle 23:00 vede "1 giorno" alle 23:00 del giorno dopo, non a mezzanotte; spostare l'orologio in avanti aumenta la durata (il device è la fonte di tempo; accettato e documentato).
- **Date:** 2026-10-02

### D-008 ✅ Anticipare dominio Timer/Ricaduta/Impulsi in M1

- **Context:** il brief ordina Timer (Phase 5) dopo Dashboard (Phase 4).
- **Chosen:** implementare e testare il dominio puro (`@free/core`) già in M1.
- **Reason:** è la sorgente di verità di dashboard, milestone e stima denaro; valida il data model prima della UI.
- **Trade-offs:** nessuno significativo; la UI resta nelle milestone previste.
- **Date:** 2026-10-02

### D-009 ✅ "Ho giocato" → "Registra una ricaduta", azione secondaria con conferma

- **Context:** conflitto Product (pulsante sempre visibile) vs UX (tap accidentali).
- **Chosen:** pulsante secondario sulla Home + flusso con conferma e scelta orario.
- **Reason:** sicurezza emotiva e correttezza dei dati; requisito del brief comunque soddisfatto.
- **Trade-offs:** un tap in più.
- **Date:** 2026-10-02

### D-010 ✅ Nessun analytics remoto nell'MVP

- **Context:** metriche utili ma dati sensibili.
- **Chosen:** eventi documentati in `product/metrics.md`, invio disattivato fino a security review (M7) e opt-in.
- **Reason:** privacy (priorità 2) prima della velocità di apprendimento.
- **Trade-offs:** meno dati di prodotto in Beta; compensato da feedback qualitativi.
- **Date:** 2026-10-02

### D-011 ✅ Categorie non disponibili nascoste nell'MVP

- **Context:** il registry contiene categorie `planned`.
- **Chosen:** mostrare solo `gambling` nell'onboarding.
- **Reason:** non promettere funzioni che non esistono (principio 8).
- **Date:** 2026-10-02

### D-012 ⏳ Licenza del codice

- **Context:** open source vs proprietario è una decisione di business.
- **Chosen (temporaneo):** "All rights reserved".
- **Richiede:** decisione dell'owner.
- **Date:** 2026-10-02

### D-013 ⏳ Modello di business

- **Context:** non deducibile dal brief.
- **Vincolo già deciso:** SOS, Help Center, storico e cancellazione dati restano sempre gratuiti; nessuna pubblicità comportamentale.
- **Richiede:** decisione dell'owner prima della Beta.
- **Date:** 2026-10-02

### D-025 ✅ Aggiornamento a Expo SDK 58

- **Context:** l'owner testa con Expo Go dagli store, che ora supporta solo SDK 58; il progetto era su SDK 57 e non si apriva più.
- **Alternatives:** restare su SDK 57 e installare a mano una vecchia Expo Go (non possibile su iOS); passare subito a una development build (richiede EAS).
- **Chosen:** aggiornamento a SDK 58 (React Native 0.88, React 19.3, Jest 30). Versioni allineate con `expo install --check`; `File.write()` di expo-file-system ora è asincrona.
- **Reason:** permette di continuare i test su telefono senza costi né account aggiuntivi.
- **Trade-offs:** ogni nuova SDK di Expo Go richiederà un aggiornamento simile; con la Beta (development build/EAS) non dipenderemo più dalla versione di Expo Go.
- **Date:** 2026-10-24

### D-022 ✅ Nessun account, confermato dall'owner

- **Context:** domanda dell'owner "ci si può registrare? cosa comporterebbe?" (analisi in `security.md` § Account e anonimato).
- **Chosen:** l'app resta senza registrazione (conferma di D-004, 2026-10-18).
- **Reason:** anonimato per costruzione; nessun dato sanitario (art. 9 GDPR) su server; nessun obbligo e rischio da titolare di quei dati.
- **Date:** 2026-10-18

### D-023 ✅ Blocco app con l'autenticazione del telefono, non con un PIN dell'app

- **Context:** proteggere i dati da chi prende in mano il telefono sbloccato.
- **Alternatives:** PIN proprio dell'app (da salvare e gestire, recupero difficile, un altro segreto da proteggere).
- **Chosen:** `expo-local-authentication` (biometria o PIN/sequenza del telefono), richiesto all'apertura e al ritorno dal background; anche lo spegnimento richiede l'autenticazione. Con blocco attivo: contenuto nascosto agli screen reader, anteprima nascosta tra le app recenti (iOS) e `FLAG_SECURE` (Android, blocca anche gli screenshot).
- **Reason:** nessun segreto salvato nell'app; meccanismo che l'utente conosce già.
- **Trade-offs:** richiede un blocco schermo sul telefono; chi conosce il PIN del telefono può aprire l'app.
- **Date:** 2026-10-18

### D-024 ✅ Export in JSON non cifrato (con avviso) e SQLCipher rinviato

- **Context:** #13 chiede export/import e una valutazione di SQLCipher.
- **Chosen:** export JSON leggibile, salvato dove sceglie l'utente tramite il menu di condivisione, con avviso esplicito "il file non è cifrato"; import validato da `parseJourney` (tutti gli invarianti del dominio) e confermato dall'utente prima di sostituire i dati. SQLCipher **rinviato** alla build di Beta: richiede una development build (non Expo Go) e la gestione di una chiave in secure store; oggi i dati sono già cifrati a riposo dal sistema operativo e protetti dal blocco app.
- **Trade-offs:** un file esportato e lasciato in giro è leggibile. Export cifrato con password: valutabile in futuro.
- **Date:** 2026-10-18

### D-021 ✅ Promemoria solo locali, neutri e spenti di default

- **Context:** F12 (notifiche) contro principi 4 (privacy) e 11 (discrezione).
- **Alternatives:** push da server; testi motivazionali espliciti ("7 giorni senza giocare!").
- **Chosen:** expo-notifications locali; check-in giornaliero e traguardi; testi fissi neutri; permesso chiesto solo all'attivazione; ripianificazione completa a ogni modifica; step facoltativo in onboarding (chiude D-018).
- **Reason:** nessun dato esce dal telefono; nessuno può dedurre il tema dalla lock screen; nessun duplicato possibile.
- **Trade-offs:** testi meno "motivanti"; niente promemoria intelligenti basati sugli orari degli impulsi (valutabile in futuro, sempre in locale).
- **Date:** 2026-10-18

### D-019 ✅ Navigazione a stack con collegamenti dalla Dashboard (niente tab per ora)

- **Context:** l'IA prevede 3 tab (Oggi, Storico, Impostazioni).
- **Alternatives:** tab di Expo Router (API non verificabile offline dall'ambiente di build in questa fase).
- **Chosen:** Stack con pulsanti "Storico" e "Impostazioni" sulla Dashboard; ogni schermata ha "Indietro".
- **Reason:** meno dipendenze e meno superficie da testare; la Dashboard resta l'unico punto di partenza, coerente con l'uso "in pochi secondi".
- **Trade-offs:** un tap in più per lo Storico; rivalutare le tab dopo i test d'uso.
- **Date:** 2026-10-13

### D-020 ✅ Ricaduta: la riflessione si compila prima del salvataggio

- **Context:** Flow 4 prevedeva salvataggio → riflessione → nota; il dominio è append-only (una ricaduta salvata non si modifica).
- **Chosen:** "Quando?" → riflessione facoltativa (fattori + nota) → salvataggio unico → "Il percorso continua." con il Telefono Verde.
- **Reason:** un solo evento completo e atomico, senza introdurre la modifica di eventi storici.
- **Trade-offs:** chi chiude l'app a metà non registra la ricaduta; può ripeterla.
- **Date:** 2026-10-13

### D-016 ✅ Il "primo obiettivo" diventa la prima milestone

- **Context:** l'onboarding chiede il primo obiettivo; serve un effetto reale e non solo estetico.
- **Alternatives:** salvarlo come preferenza "in evidenza" separata; ignorarlo.
- **Chosen:** le milestone del percorso partono dall'obiettivo scelto e proseguono con i default successivi (es. 7 giorni → 7, 14, 30, 60, 90, 180, 365).
- **Reason:** nessun nuovo concetto nel dominio; la Dashboard mostra già "Prossimo obiettivo".
- **Trade-offs:** chi sceglie 7 giorni non vede i traguardi di 24 h e 3 giorni; potrà aggiungerli dalle impostazioni obiettivi (M4).
- **Date:** 2026-10-08

### D-017 ✅ Data di inizio con "quanti giorni fa" + "a che ora", senza selettore nativo

- **Context:** Flow 1 prevede un picker di data/ora non nel futuro.
- **Alternatives:** `@react-native-community/datetimepicker` (API diverse tra Android e iOS, modulo nativo, test più fragili).
- **Chosen:** due campi testuali validati (`parseStart`), con anteprima "Inizio: 6 ottobre alle ore 21:40".
- **Reason:** accessibile con screen reader e font grandi, nessuna dipendenza nativa, logica pura testata anche sul cambio d'ora.
- **Trade-offs:** meno "nativo"; rivalutare dopo i test d'uso in Beta.
- **Date:** 2026-10-08

### D-018 ✅ Step "Notifiche" rinviato a M6 (chiusa da D-021: step "Promemoria" aggiunto)

- **Context:** il brief prevede uno step notifiche nell'onboarding; le notifiche arrivano in M6.
- **Chosen:** l'onboarding ha 5 step; lo step notifiche verrà aggiunto insieme alla funzione.
- **Reason:** non descrivere funzioni che non esistono (principio 8) e tenere l'onboarding breve.
- **Date:** 2026-10-08

### D-015 ✅ `node:sqlite` invece di better-sqlite3 per i test di integrazione

- **Context:** i test di repository e migrazioni devono girare su SQLite reale in CI.
- **Alternatives:** better-sqlite3 (modulo nativo, prebuilt scaricati da GitHub al momento dell'install); mock dell'SQL.
- **Chosen:** `node:sqlite`, incluso in Node ≥ 22.5 (SQLite 3.50), dietro l'interfaccia `SqlExecutor`.
- **Reason:** nessuna dipendenza nativa né download extra; stesso dialetto SQL del device.
- **Trade-offs:** modulo ancora "experimental" in Node 22 (avviso a runtime); se l'API cambiasse, l'adapter è isolato in un file.
- **Date:** 2026-10-08

### D-014 ✅ Dati esclusi dai backup automatici di sistema, export su file a cura dell'utente

- **Context:** i backup automatici iCloud/Google copierebbero dati sensibili fuori dal device.
- **Alternatives:** lasciare i backup di sistema (comodo al cambio telefono, ma i dati finiscono nel cloud dell'utente senza che lo scelga esplicitamente).
- **Chosen:** decisione dell'owner (2026-10-18): esclusione dai backup + export/import JSON scelto dall'utente (#13). Android: `allowBackup: false` in `app.json`.
- **Reason:** privacy (priorità 2): nessuna copia fuori dal telefono senza un'azione esplicita.
- **Trade-offs:** chi cambia telefono senza esportare perde i dati. **iOS non ancora coperto:** escludere il database da iCloud richiede codice nativo (`NSURLIsExcludedFromBackupKey`) via config plugin in una development build; da fare prima della Beta iOS (#13).
- **Date:** 2026-10-02 · decisa 2026-10-18
