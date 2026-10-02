# Competitive Analysis

_Owner: A1 App Ideas Agent. Data di analisi: 2026-10-02._

> **Metodo e limiti.** Analisi desk basata su pagine pubbliche, schede degli store e risultati di
> ricerca. Dall'ambiente di build l'accesso diretto ad alcuni siti era bloccato: le descrizioni sono
> volutamente ad alto livello (pattern, non dettagli) e vanno **ri-verificate prima di citarle
> esternamente**. Non copiamo UI né codice: estraiamo pattern, criticità e opportunità.

## Panorama

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

## Pattern UX da adottare

1. **Contatore come elemento eroe** della Home, leggibile a colpo d'occhio.
2. **Pulsante SOS/impulso** sempre raggiungibile (pattern consolidato nelle "quit app").
3. **Milestone progressive** con piccoli primi traguardi (24h, 3 giorni) per rinforzo precoce.
4. **Esercizi di 1–3 minuti** (respirazione, attesa guidata) dalle app di wellness.
5. **Risorse di crisi** integrate (pattern delle app cliniche).

## Pattern da evitare

1. **Reset a zero** che cancella o nasconde il passato → noi: periodi + tempo totale cumulativo.
2. **Gamification competitiva** (classifiche, "batti il tuo record" aggressivo).
3. **Paywall sulla sicurezza** (risorse d'aiuto, SOS): devono essere sempre gratuiti.
4. **Account obbligatorio** prima di vedere valore.
5. **Notifiche esplicite** ("Sono 30 giorni che non giochi d'azzardo!") visibili sulla lock screen.
6. **Estetica casinò** (oro, neon, fiches) o celebrazioni stile jackpot.

## Opportunità di differenziazione

| Opportunità                               | Come la realizziamo                                                                                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ricaduta come parte del percorso**      | Storico append-only, tempo totale cumulativo, milestone conservate, flusso di riflessione (F6). Nessun concorrente analizzato lo rende principio architetturale. |
| **Risorse italiane ufficiali verificate** | Help Center con TVNGA (ISS), mappa servizi ISS, autoesclusione ADM, con fonte e data di verifica.                                                                |
| **Privacy radicale**                      | Nessun account, nessun dato sensibile fuori dal dispositivo, notifiche neutre, nome/icona discreti.                                                              |
| **Tono adulto e sobrio**                  | Design system calmo, linguaggio di continuità, niente infantilismi.                                                                                              |
| **Architettura multi-categoria**          | Registry di categorie nel dominio: estensione senza riscrittura.                                                                                                 |
| **Gratuito sulle funzioni di sicurezza**  | SOS, Help Center e storico mai dietro paywall (vincolo per qualsiasi modello di business futuro, D-013).                                                         |

## Implicazioni per l'MVP

Le opportunità sopra sono coperte da F2, F5, F6, F7, F8 e dal security model. Nessuna feature
aggiunta "per parità" con i concorrenti (principio 10).
