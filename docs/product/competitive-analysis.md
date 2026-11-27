# Competitive Analysis

_Owner: A1 App Ideas Agent. Prima analisi: 2026-10-02 · aggiornata: 2026-11-27._

## Aggiornamento 2026-11-27

> **Metodo e limiti.** Ricerca web (motori di ricerca); le pagine di App Store e Google Play non
> erano raggiungibili dall'ambiente, quindi prezzi e funzioni vengono dalle schede indicizzate e
> vanno riverificati prima di citarli. Molti confronti "migliori app" sono scritti da chi vende
> una delle app confrontate.

### Cosa è cambiato da ottobre

1. **Mercato affollato e a pagamento.** Decine di nuove app in inglese per smettere di giocare
   (Betless, QuitBet, Unbet, Recovo, Bye Bet, Whistl, Gamblr…). Modello tipico: prova gratuita,
   poi abbonamento, spesso con un "coach" di intelligenza artificiale. Esempi: Betless 9,99 $/mese
   o 89,99 $/anno; QUITTR in abbonamento obbligatorio; I Am Sober gratuita di base, Plus 9,99 $/mese.
2. **In italiano c'è poco.**
   - _Stop Gioco Azzardo & Scommesse_: versione italiana di un'app internazionale; contatore,
     traguardi, blocco di app e siti di scommesse; abbonamento (8,99 €/mese, 29,99 €/anno).
   - _Dipendenza da Gioco_ (App Diggity): contatore con stima del risparmio, nessun dato raccolto,
     apparentemente datata.
   - Enti pubblici: _Chiama & Vinci_ (ULSS 3 Serenissima, Regione Veneto) per la prevenzione, non
     per il percorso quotidiano. Nessuna app di ASL o Regioni per seguire il percorso: i siti
     istituzionali rimandano ai Ser.D.
3. **Concorrenti con filosofia simile.** _GamFree_ (Android): gratuita, senza account, senza
   pubblicità né abbonamenti, timer e linee di aiuto; in inglese e con livelli di gioco. _Gamblr_
   dichiara di non usare trucchi per trattenere gli utenti. ⚠️ Il nome _GamFree_ è simile a _Free_:
   da considerare nella verifica del marchio (D-002).
4. **Ricaduta senza azzeramento non più esclusiva.** Recovo conserva la serie migliore; Unbet azzera
   la serie ma conserva i traguardi. Free resta più completo (storico intero, tempo totale,
   traguardi conservati anche togliendo un obiettivo), ma non è più un unicum.
5. **Lamentele degli utenti.** Soprattutto i pagamenti ("dovrebbe essere gratuita", abbonamento
   chiesto dopo pochi minuti), poi blocchi facili da aggirare e app instabili.
6. **Privacy.** Uno studio di ExpressVPN ha trovato SDK di tracciamento in 7 app su 10 per il
   recupero dagli oppioidi; la scheda Play di I Am Sober dichiara possibili condivisioni con terzi.
7. **Evidenze scientifiche.** Revisione 2023 di 14 app per il gioco d'azzardo: qualità media sotto
   la soglia di accettabilità (scala MARS); migliori le app con contenuti di terapia
   cognitivo-comportamentale; le community aumentano l'uso. Efficacia poco studiata; risultati
   preliminari promettenti per un'app sugli impulsi (GamblingLess).
8. **Blocchi dei siti.** _BetBlocker_: gratuito, gestito da un ente benefico scozzese, finanziato
   da donazioni, senza acquisti in-app; Android, iOS e desktop; periodi da 1 giorno a 5 anni non
   revocabili. _Gamban_: a pagamento.

### Implicazioni per Free

- **Posizionamento:** italiano per primo, gratuito, privato, risorse ufficiali verificate, ricaduta
  che non cancella nulla. Nessuna app trovata unisce tutti questi elementi.
- **Da valutare:** segnalare i blocchi dei siti (BetBlocker) in "Strumenti per proteggerti", dopo
  verifica sulla fonte ufficiale.
- **Contenuti:** esercizi ispirati alla terapia cognitivo-comportamentale, con la revisione
  professionale già prevista (#17).
- **Da evitare:** coach di intelligenza artificiale, livelli e gamification, abbonamenti.

### Fonti principali

- McCurdy, Loya et al., _Smartphone Apps for Problem Gambling: a Review of Content and Quality_
  (2023): <https://link.springer.com/article/10.1007/s40429-023-00479-2>
- _GamblingLess: Curb Your Urge_ (JMIR 2021): <https://www.jmir.org/2021/3/e25786/>
- Stop Gioco Azzardo & Scommesse: <https://apps.apple.com/it/app/stop-gioco-azzardo-scommesse/id6751584830>
- Dipendenza da Gioco: <https://apps.apple.com/it/app/dipendenza-da-gioco/id1112385176>
- Chiama & Vinci: <https://apps.apple.com/us/app/id1548302019>
- GamFree: <https://play.google.com/store/apps/details?id=com.gamfree.app>
- Gamblr: <https://apps.apple.com/app/id6772988498>
- Recovo: <https://apps.apple.com/bg/app/recovo-quit-gambling/id6760682057>
- Unbet: <https://apps.apple.com/us/app/unbet-quit-gambling-recover/id6765943063>
- BetLess: <https://www.appbetless.com/>
- ExpressVPN, _Privacy Risks With Opioid Recovery Apps_: <https://www.expressvpn.com/digital-security-lab/opioid-telehealth-research>
- BetBlocker (pagina italiana): <https://betblocker.org/it/>

---

## Analisi iniziale (2026-10-02)

> **Metodo e limiti.** Analisi desk basata su pagine pubbliche, schede degli store e risultati di
> ricerca. Dall'ambiente di build l'accesso diretto ad alcuni siti era bloccato: le descrizioni sono
> volutamente ad alto livello (pattern, non dettagli) e vanno **ri-verificate prima di citarle
> esternamente**. Non copiamo UI né codice: estraiamo pattern, criticità e opportunità.

### Panorama

| Categoria                      | Esempi                                                                     | Cosa fanno bene                                                                                        | Criticità ricorrenti                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Sobriety tracker generalisti   | I Am Sober, Nomo, Quitzilla                                                | Contatore grande e immediato; milestone; stima risparmio; più "dipendenze" in un'app                   | Streak che si azzera alla ricaduta; spesso community con moderazione variabile; paywall su funzioni di base; estetica a volte infantile |
| App specifiche gioco d'azzardo | Gambling Therapy (Gordon Moody), app di servizi sanitari/charity nazionali | Contenuti clinicamente curati; auto-valutazione; supporto live via chat; info di crisi; link a blocker | UX datata o orientata all'informazione più che al monitoraggio quotidiano; spesso solo in inglese                                       |
| Blocker                        | Gamban, BetBlocker                                                         | Barriera tecnica concreta all'accesso ai siti                                                          | Non aiutano con consapevolezza, motivazione o storico; permessi invasivi (VPN/profili)                                                  |
| "Quit" app consumer recenti    | QUITTR e simili                                                            | Pulsante "panic"/SOS molto visibile; onboarding persuasivo; design moderno                             | Gamification aggressiva, linguaggio di vergogna/sfida, paywall forti, raccolta dati estesa                                              |
| Habit tracker                  | Streaks, Loop Habit Tracker                                                | Interazioni rapidissime; widget; visualizzazione calendario                                            | Modello "catena da non spezzare" → la rottura è percepita come fallimento                                                               |
| Mental wellness                | Headspace, Calm                                                            | Esercizi brevi guidati (respirazione), design calmo e premium                                          | Non specifici per dipendenze; abbonamento                                                                                               |

Fonte di riferimento per la panoramica delle app di recupero dal gioco: elenco curato da Extern
Problem Gambling (Irlanda) — <https://www.problemgambling.ie/gambling-addiction-recovery-apps.html>
(consultato tramite indice di ricerca il 2026-10-02).

### Pattern UX da adottare

1. **Contatore come elemento eroe** della Home, leggibile a colpo d'occhio.
2. **Pulsante SOS/impulso** sempre raggiungibile (pattern consolidato nelle "quit app").
3. **Milestone progressive** con piccoli primi traguardi (24h, 3 giorni) per rinforzo precoce.
4. **Esercizi di 1–3 minuti** (respirazione, attesa guidata) dalle app di wellness.
5. **Risorse di crisi** integrate (pattern delle app cliniche).

### Pattern da evitare

1. **Reset a zero** che cancella o nasconde il passato → noi: periodi + tempo totale cumulativo.
2. **Gamification competitiva** (classifiche, "batti il tuo record" aggressivo).
3. **Paywall sulla sicurezza** (risorse d'aiuto, SOS): devono essere sempre gratuiti.
4. **Account obbligatorio** prima di vedere valore.
5. **Notifiche esplicite** ("Sono 30 giorni che non giochi d'azzardo!") visibili sulla lock screen.
6. **Estetica casinò** (oro, neon, fiches) o celebrazioni stile jackpot.

### Opportunità di differenziazione

| Opportunità                               | Come la realizziamo                                                                                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ricaduta come parte del percorso**      | Storico append-only, tempo totale cumulativo, milestone conservate, flusso di riflessione (F6). Nessun concorrente analizzato lo rende principio architetturale. |
| **Risorse italiane ufficiali verificate** | Help Center con TVNGA (ISS), mappa servizi ISS, autoesclusione ADM, con fonte e data di verifica.                                                                |
| **Privacy radicale**                      | Nessun account, nessun dato sensibile fuori dal dispositivo, notifiche neutre, nome/icona discreti.                                                              |
| **Tono adulto e sobrio**                  | Design system calmo, linguaggio di continuità, niente infantilismi.                                                                                              |
| **Architettura multi-categoria**          | Registry di categorie nel dominio: estensione senza riscrittura.                                                                                                 |
| **Gratuito sulle funzioni di sicurezza**  | SOS, Help Center e storico mai dietro paywall (vincolo per qualsiasi modello di business futuro, D-013).                                                         |

### Implicazioni per l'MVP

Le opportunità sopra sono coperte da F2, F5, F6, F7, F8 e dal security model. Nessuna feature
aggiunta "per parità" con i concorrenti (principio 10).
