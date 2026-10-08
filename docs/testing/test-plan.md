# Test Plan

_Owner: Team D. Stato colonne: ✅ automatizzato · 🟡 previsto (milestone) · 👤 manuale._

## 1. Flussi critici e acceptance criteria

### TC-ONB — Onboarding

| ID    | Acceptance criteria                                                                  | Stato                                                                                          |
| ----- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| ONB-1 | Completo onboarding con "Adesso" in 5 schermate; la Dashboard mostra 0 giorni, 0 ore | ✅ component (`OnboardingFlow.test.tsx`) · 🟡 E2E `apps/mobile/e2e/onboarding.yaml` (CI in M6) |
| ONB-2 | Data di inizio nel passato → giorni/ore corretti in Dashboard                        | ✅ core + `onboardingModel.test.ts` (incluso cambio d'ora) + component                         |
| ONB-3 | Data nel futuro non accettata, con spiegazione                                       | ✅ core + component                                                                            |
| ONB-4 | "Salta" su denaro non crea dati né chiede permessi                                   | ✅ component (stima disattivata di default; nessun permesso richiesto)                         |
| ONB-5 | Kill dell'app a metà onboarding → riprende dallo step corretto                       | ✅ component (progress in `app_settings`)                                                      |

### TC-TIM — Timer

| ID    | Acceptance criteria                                                                   | Stato                                                                     |
| ----- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| TIM-1 | Durata = now − startedAt; scomposizione giorni/ore/min corretta                       | ✅                                                                        |
| TIM-2 | "1 giorno" esattamente a 24h dall'inizio                                              | ✅                                                                        |
| TIM-3 | Transizione DST Europe/Rome non altera la durata                                      | ✅                                                                        |
| TIM-4 | Orologio indietro → 0 + `clockSkew`, nessun dato modificato                           | ✅ core · 🟡 UI banner                                                    |
| TIM-5 | Riavvio app / kill / reboot → valore ricalcolato identico                             | ✅ core (stateless) · ✅ ricarica da DB (`journeyStore.test.ts`) · 🟡 E2E |
| TIM-6 | Cambio timezone del device → durata invariata, data di inizio mostrata nel nuovo fuso | ✅ core · ✅ test app con `TZ=Europe/Rome`                                |
| TIM-7 | Ritorno da background → aggiornamento immediato                                       | 🟡 M3                                                                     |

### TC-URG — Impulso

| ID    | Acceptance criteria                                                           | Stato           |
| ----- | ----------------------------------------------------------------------------- | --------------- |
| URG-1 | Salvataggio con intensità, trigger, durata, azioni, esito, nota               | ✅ core · 🟡 UI |
| URG-2 | Statistiche aggiornate (conteggio, superati)                                  | ✅              |
| URG-3 | Limiti: intensità 1 e 10 ok; 0, 11, 5.5 rifiutati; durata −1/1441 rifiutate   | ✅              |
| URG-4 | Doppio tap su Salva → un solo record (`duplicate_id` + pulsante disabilitato) | ✅ core · 🟡 UI |
| URG-5 | Esito "Ho giocato" non chiude il periodo; viene offerto il flusso ricaduta    | ✅ core · 🟡 UI |
| URG-6 | SOS raggiungibile in 1 tap dalla Dashboard; numero TVNGA chiamabile           | 🟡 M4 E2E       |

### TC-REL — Ricaduta

| ID    | Acceptance criteria                                                          | Stato                                        |
| ----- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| REL-1 | Crea nuovo periodo e chiude il precedente all'istante indicato               | ✅                                           |
| REL-2 | Storico precedente conservato (periodi, impulsi)                             | ✅                                           |
| REL-3 | Milestone del periodo chiuso conservate                                      | ✅                                           |
| REL-4 | Dashboard aggiornata al nuovo periodo; tempo totale continua a crescere      | ✅ core · 🟡 E2E                             |
| REL-5 | Orario prima dell'inizio periodo o nel futuro → rifiutato                    | ✅                                           |
| REL-6 | Ripartenza successiva all'orario della ricaduta supportata                   | ✅                                           |
| REL-7 | Nessun copy vietato ("fallito", "reset", "da zero") e nessun colore `danger` | 👤 UX review · 🟡 test snapshot testi        |
| REL-8 | Le risorse di supporto sono visibili nella riflessione                       | 🟡 M4                                        |
| REL-9 | Scrittura atomica: errore DB a metà → nessun cambiamento persistito          | ✅ integration (`JourneyRepository.test.ts`) |

### TC-MON — Stima denaro

| ID    | Acceptance criteria                                            | Stato           |
| ----- | -------------------------------------------------------------- | --------------- |
| MON-1 | Calcolo corretto per giorno/settimana/mese                     | ✅              |
| MON-2 | Zero all'inizio; arrotondamento per difetto                    | ✅              |
| MON-3 | Valori mancanti → stato `incomplete` (nessun numero inventato) | ✅              |
| MON-4 | Disattivazione → stato `disabled`, la card scompare            | ✅ core · 🟡 UI |
| MON-5 | Valori estremi → intero sicuro                                 | ✅              |
| MON-6 | Etichetta "Stima del denaro non speso" sempre presente         | ✅ component    |

### TC-HIS — Storico, TC-GOAL — Obiettivi, TC-HELP — Help Center

| ID     | Acceptance criteria                                                                  | Stato   |
| ------ | ------------------------------------------------------------------------------------ | ------- |
| HIS-1  | Riepilogo: tempo totale, periodo più lungo, impulsi superati                         | ✅ core |
| HIS-2  | Empty state alla prima apertura                                                      | 🟡 M4   |
| GOAL-1 | Milestone configurabili, ordinate, deduplicate, validate                             | ✅      |
| GOAL-2 | Progresso verso la prossima milestone corretto; completamento quando tutte raggiunte | ✅      |
| HELP-1 | Help Center a 1 tap dalla Home, funzionante offline                                  | 🟡 M5   |
| HELP-2 | Ogni risorsa mostra fonte e data di verifica                                         | 🟡 M5   |

## 2. Edge case (Edge Case Tester)

| Caso                                                       | Atteso                                                                 | Copertura                                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Prima apertura, nessun dato                                | Onboarding; nessuna query fallisce                                     | ✅ integration + component (`HomeScreen.test.tsx`)                 |
| Cancellazione dati                                         | Torna all'onboarding; DB rimosso; notifiche annullate                  | 🟡 M7                                                              |
| Cambio data/ora manuale avanti                             | Durata cresce (accettato: il device è la fonte di tempo) — documentato | ✅ (comportamento definito)                                        |
| Cambio data/ora indietro                                   | Clock skew gestito                                                     | ✅                                                                 |
| Timezone / DST                                             | Durata invariata                                                       | ✅                                                                 |
| Reinstallazione                                            | Dati persi (local-first) salvo export/backup; onboarding pulito        | 🟡 M7 (dipende da D-014)                                           |
| Perdita connessione                                        | Nessun impatto sul core; link esterni con numero copiabile             | 🟡 M5                                                              |
| DB corrotto / JSON invalido                                | ErrorState con opzioni; mai cancellazione silenziosa                   | ✅ `DataCorruptionError` (5 casi) + ErrorState con Riprova         |
| Migrazione interrotta                                      | Rollback transazione                                                   | ✅ integration                                                     |
| Dati mancanti (campi null)                                 | Stati `incomplete`/vuoti, nessun crash                                 | ✅ core                                                            |
| Valori estremi (100 anni, importi massimi, 10.000 impulsi) | Nessun overflow; UI fluida                                             | ✅ core · 🟡 perf M6                                               |
| Doppio tap                                                 | Nessun duplicato                                                       | ✅ core · ✅ Button · ✅ store (comandi serializzati, id del form) |
| Notifiche duplicate                                        | Riprogrammazione idempotente (cancella+ripianifica per id)             | 🟡 M6                                                              |
| Sessione scaduta                                           | N/A nell'MVP (nessun account)                                          | —                                                                  |
| Testo nota > 2000 caratteri, emoji, RTL                    | Rifiuto oltre il limite; emoji/RTL salvati correttamente               | ✅ limite · 🟡 UI                                                  |
| Font 200%, screen reader                                   | Nessun testo troncato nei flussi critici                               | 👤 fine M3/M4                                                      |

## 3. Release QA — criteri di blocco

Il rilascio è **bloccato** se esiste anche uno di:

- bug che altera, perde o duplica dati dello storico;
- timer errato in qualsiasi scenario della sezione TC-TIM;
- copy colpevolizzante o risorse d'aiuto non verificate/errate;
- dato sensibile in log, notifiche o traffico di rete;
- flusso critico E2E rosso;
- regressione di accessibilità nei flussi critici.
