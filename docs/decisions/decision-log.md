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

### D-015 ✅ `node:sqlite` invece di better-sqlite3 per i test di integrazione

- **Context:** i test di repository e migrazioni devono girare su SQLite reale in CI.
- **Alternatives:** better-sqlite3 (modulo nativo, prebuilt scaricati da GitHub al momento dell'install); mock dell'SQL.
- **Chosen:** `node:sqlite`, incluso in Node ≥ 22.5 (SQLite 3.50), dietro l'interfaccia `SqlExecutor`.
- **Reason:** nessuna dipendenza nativa né download extra; stesso dialetto SQL del device.
- **Trade-offs:** modulo ancora "experimental" in Node 22 (avviso a runtime); se l'API cambiasse, l'adapter è isolato in un file.
- **Date:** 2026-10-08

### D-014 ⏳ Policy di backup di sistema del database

- **Context:** i backup automatici iCloud/Google copierebbero dati sensibili fuori dal device.
- **Proposta:** escludere il DB dai backup + export manuale (P1).
- **Da decidere:** in M7 con Security e UX (trade-off perdita dati al cambio telefono).
- **Date:** 2026-10-02
