# MVP Definition

_Owner: Team A (A1 App Ideas, A3 Goals, A4 Help Center) con review di Team B, C, D.
Ultimo aggiornamento: 2026-10-02._

Obiettivo dell'MVP: un'app **realmente funzionante, solo locale**, che copra il ciclo completo
_inizio → monitoraggio → impulso → (eventuale) ricaduta → ripartenza → storico_ per la categoria
gioco d'azzardo, con Help Center verificato.

## Scheda feature (formato A1)

Legenda: Complessità/Rischio S·M·L. Priorità P0 = indispensabile per MVP, P1 = V1, P2 = futuro.

| #   | Feature                                                                                                                                | Problema risolto                         | Valore     | Compl. | Rischio                 | Prio                        | Dipendenze tecniche                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------- | ------ | ----------------------- | --------------------------- | --------------------------------------- |
| F1  | **Onboarding breve** (categoria, data/ora di inizio, primo obiettivo, denaro opzionale, notifiche opzionali)                           | Partire in < 60 s senza dati inutili     | Alto       | S      | Basso                   | P0                          | `@free/core` createJourney, persistenza |
| F2  | **Dashboard** (tempo trascorso giorni/ore/min, data inizio, prossima milestone con anello di progresso, stima denaro, pulsanti rapidi) | "Come sto andando?" in un colpo d'occhio | Alto       | M      | Basso                   | P0                          | F1, F3                                  |
| F3  | **Timer coerente** (calcolo da istante UTC salvato, robusto a timezone/DST/riavvio/background, gestione clock skew)                    | Fiducia nel numero mostrato              | Alto       | S      | Medio                   | P0                          | core `time.ts` ✅                       |
| F4  | **Impulso / craving tracker** (intensità 1–10, trigger, durata, azioni, esito, nota)                                                   | Consapevolezza dei pattern               | Alto       | M      | Basso                   | P0                          | core `recordUrge` ✅                    |
| F5  | **"Ho un impulso adesso"**: schermata SOS con tecnica di respirazione/attesa 15 min + contatti d'aiuto + registra                      | Superare il picco dell'impulso           | Molto alto | M      | Medio (contenuti)       | P0                          | F4, F8                                  |
| F6  | **Ricaduta non punitiva** (conferma → salva → chiude periodo → nuovo periodo → riflessione → risorse → nota)                           | Evitare l'abbandono dopo una ricaduta    | Molto alto | M      | Alto (tono)             | P0                          | core `recordRelapse` ✅                 |
| F7  | **Storico** (periodi con durata, ricadute, impulsi, milestone, stima denaro, note)                                                     | Vedere il percorso intero                | Alto       | M      | Basso                   | P0                          | core `journeyStats` ✅                  |
| F8  | **Help Center** (cosa fare in caso di impulso, dopo una ricaduta, FAQ, risorse ufficiali verificate, emergenza)                        | Accesso rapido ad aiuto reale            | Molto alto | S      | Alto (accuratezza)      | P0                          | Contenuti verificati (help-center.md)   |
| F9  | **Obiettivi/milestone configurabili** (default 1–365 giorni, modificabili)                                                             | Piccoli obiettivi raggiungibili          | Medio      | S      | Basso                   | P0                          | core `updateMilestones` ✅              |
| F10 | **Stima denaro non speso** (opzionale, disattivabile, etichettata come stima)                                                          | Motivazione concreta                     | Medio      | S      | Medio (percezione)      | P0                          | core `money.ts` ✅                      |
| F11 | **Impostazioni privacy**: tema (light/dark/system), notifiche, cancella tutti i dati, esporta (JSON)                                   | Controllo e fiducia                      | Alto       | S      | Medio                   | P0 (cancella) / P1 (export) | Persistenza                             |
| F12 | **Notifiche locali opzionali** (milestone, check-in giornaliero) con testo neutro                                                      | Ritorno all'app nei momenti giusti       | Medio      | M      | Medio (privacy)         | P1                          | expo-notifications                      |
| F13 | Blocco app con biometria/PIN                                                                                                           | Privacy su dispositivi condivisi         | Medio      | M      | Medio                   | P1                          | expo-local-authentication               |
| F14 | Statistiche aggregate (trigger più frequenti, orari a rischio)                                                                         | Pattern nel tempo                        | Medio      | M      | Basso                   | P1                          | F4 con dati sufficienti                 |
| F15 | Obiettivi giornalieri/settimanali (es. "registra come stai")                                                                           | Rinforzo quotidiano                      | Medio      | M      | Medio (gamification)    | P1                          | F12                                     |
| F16 | Account + backup cifrato end-to-end                                                                                                    | Cambio telefono senza perdere dati       | Medio      | L      | Alto                    | P2                          | Backend, crypto                         |
| F17 | Altre categorie (alcol, fumo, gaming, social)                                                                                          | Estensione mercato                       | Alto       | M      | Alto (contenuti)        | P2                          | Registry categorie ✅                   |
| F18 | Localizzazione EN + risorse per altri paesi                                                                                            | Estensione mercato                       | Medio      | M      | Alto (verifica risorse) | P2                          | i18n                                    |

### Feature valutate e scartate (per ora)

| Proposta                                                   | Motivo dello scarto (Lead Orchestrator)                                                                                    |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Community/forum interno                                    | Rischio sicurezza e moderazione sproporzionato; rimandiamo a gruppi esistenti (Giocatori Anonimi).                         |
| Classifiche / confronto con altri utenti                   | Gamification competitiva: contraria ai principi 1 e 5.                                                                     |
| Blocco siti di gioco integrato                             | Richiede VPN/permessi invasivi; esistono strumenti dedicati e l'autoesclusione ADM. Linkati nell'Help Center.              |
| Chatbot "terapeutico" AI                                   | Rischio di consigli clinici errati; contrario al posizionamento "non terapia". Rivalutabile solo con supervisione clinica. |
| Rilevamento automatico ricadute (es. transazioni bancarie) | Invasivo; contrario a privacy e principio 3.                                                                               |
| Badge con premi/coriandoli                                 | Rischio di estetica "jackpot"; usiamo milestone sobrie.                                                                    |

### Conflitto risolto: "Ho giocato" sulla Home

- **Product** voleva il pulsante "Ho giocato" sempre visibile (richiesto dal brief).
- **UX** segnalava il rischio di tap accidentali con effetto distruttivo percepito.
- **Engineering** ha confermato che il dominio non distrugge nulla (append-only) ma un tap errato
  creerebbe un periodo spurio.
- **Decisione (D-009):** pulsante presente sulla Home come azione secondaria ("Registra una
  ricaduta"), che apre un flusso con conferma esplicita e scelta dell'orario; nessuna azione
  irreversibile in un tap. Etichetta definita nel design system.

## Scope MVP (in)

F1–F11 (export JSON in P1), solo italiano, solo gioco d'azzardo, solo dati locali, nessun backend.

## Scope MVP (out)

Account, sync, analytics remoti (le metriche restano progettate ma disattivate finché non c'è
una soluzione privacy-safe approvata in security review), altre categorie, altre lingue.

## Assunzioni (documentate invece di chiedere)

1. Mercato iniziale: Italia, lingua italiana, valuta EUR.
2. Utenti adulti; nessuna verifica età (l'app non contiene gioco né contenuti per adulti), ma
   dichiarazione in onboarding.
3. L'app è gratuita nell'MVP; il modello di business è una decisione aperta (D-013).
4. Un solo percorso attivo per categoria per utente/dispositivo.
