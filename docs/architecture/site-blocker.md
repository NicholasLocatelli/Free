# Blocco dei siti di gioco (funzione a pagamento)

_Progetto del 2026-11-27, decisione D-030. Stato: fase 1 in corso (lista, corrispondenza dei domini, stato)._

## Obiettivo

Impedire l'apertura dei siti (e, dove possibile, delle app) di gioco d'azzardo sul telefono
dell'utente, dentro Free, come **unica funzione a pagamento**. Il resto dell'app resta gratuito
(D-013 come modificata da D-030).

## Principi che non cambiano

- **Nessun dato esce dal telefono.** Il filtro lavora sul dispositivo: nessun server nostro,
  nessuna analisi del traffico fuori dal telefono, nessun elenco dei siti visitati salvato.
- **Mai a pagamento la sicurezza.** SOS, Aiuto, storico e cancellazione dei dati restano gratuiti;
  nella sezione "Strumenti per proteggerti" restano visibili le alternative gratuite verificate
  (es. BetBlocker, autoesclusione ADM).
- **Onestà sui limiti.** L'app dice chiaramente che un blocco si può aggirare e che è un aiuto,
  non una garanzia.

## Piattaforme

| Piattaforma          | Tecnica                                                                  | Copertura                                | Vincoli esterni                                                                                    |
| -------------------- | ------------------------------------------------------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Android              | `VpnService` **locale**: risponde alle richieste DNS dei domini in lista | Tutto il telefono (browser e app)        | Dichiarazione VpnService in Play Console; build nativa (non Expo Go); l'utente può spegnere la VPN |
| iOS (fase 1, decisa) | **Safari Content Blocker** (estensione)                                  | Solo Safari                              | Nessun permesso speciale; l'utente la attiva in Impostazioni → Safari → Estensioni                 |
| iOS (dopo)           | Tempo di utilizzo (`FamilyControls`, `ManagedSettings`)                  | App e siti, ma limite di circa 50 domini | Permesso di distribuzione concesso da Apple su richiesta (attese di settimane, esito incerto)      |

Android per primo, coerente con D-028.

## Lista dei siti

- Fonti con licenza compatibile, da verificare una per una prima dell'uso (es. elenco "gambling"
  di StevenBlack/hosts, Block List Project), più l'**elenco ADM dei siti inibiti** e i domini dei
  concessionari autorizzati in Italia (dati pubblici).
- Lista inclusa nell'app (funziona offline, nessuna richiesta di rete) e aggiornata a ogni
  versione dell'app. Nessun download dinamico nella prima versione (D-004).
- Script di costruzione nel repository, con fonti, licenze e data registrate.

### Stato della lista (2026-11-27)

- Costruita con `pnpm blocklist` (`tools/blocklist/`): fonti e licenze in `sources.json`,
  domini mai bloccabili in `allowlist.txt`, risultato in `apps/mobile/blocklist/`
  (`gambling.txt.gz`, `manifest.json` con data, conteggi e hash).
- Fonti attuali: The Block List Project, elenco "gambling" (Unlicense, pubblico dominio) e
  StevenBlack/hosts "gambling-only" (MIT). Circa 343.000 domini, 1,4 MB compressi; include i
  principali operatori con concessione in Italia.
- L'allowlist ha già evitato un errore: la fonte pubblica conteneva `gamblersanonymous.org`.
- Elenco ADM dei siti inibiti: da aggiungere (il sito ADM non è raggiungibile dalla sessione
  di sviluppo).
- Regole di corrispondenza in `features/blocker/domainMatch.ts`: un host è bloccato se lui o un
  dominio padre è in lista. I casi condivisi con i filtri nativi sono in `matchVectors.json`.
- Safari accetta un numero limitato di regole per estensione: per iOS (fase 4) servirà una
  selezione della lista.

## Impegno

- L'utente sceglie un periodo di blocco (es. 1, 7, 30, 90 giorni). Durante il periodo Free non
  offre il pulsante per spegnerlo; spiega però come funziona il sistema (Android permette sempre
  di spegnere una VPN dalle impostazioni).
- Suggerimento di attivare "VPN sempre attiva" e "Blocca connessioni senza VPN" su Android.

## Pagamento

- Acquisto nell'app tramite gli store (Google Play Billing, StoreKit), **senza servizi di terzi
  che ricevono dati** (es. niente RevenueCat). Verifica dell'acquisto sul telefono, perché Free
  non ha server.
- **Acquisto unico** (decisione dell'owner, 2026-11-27): si paga una volta e resta per sempre. Prezzo da decidere.
- "Ripristina acquisti" obbligatorio.
- Prerequisiti fuori dal codice: account Google Play e Apple attivi, profilo fiscale e bancario
  negli store, **parere di un commercialista** sugli obblighi fiscali prima di attivare i pagamenti.

## Fasi

1. **Fondamenta (verificabili qui):** script della lista con licenze, logica di corrispondenza dei
   domini con test, modello dello stato (acquistato, attivo, periodo) e schermate.
2. **Android:** modulo nativo locale con `VpnService` (Kotlin), avvio e arresto, notifica
   permanente obbligatoria, test su development build (EAS).
3. **Pagamento:** libreria per gli acquisti, schermata di acquisto, ripristino, prodotti creati
   negli store; test con gli account di prova degli store.
4. **iOS Safari:** estensione Content Blocker generata dalla stessa lista.
5. **Pubblicazione:** dichiarazione VpnService, schede degli store, privacy policy aggiornata.

## Rischi

- **Etico:** una protezione a pagamento per persone in difficoltà, anche economica. Mitigazione:
  alternative gratuite sempre visibili, prezzo basso, nessuna pressione all'acquisto (niente
  inviti ripetuti, niente offerte a tempo).
- **Store:** rifiuto della dichiarazione VpnService o dell'estensione; i permessi Apple per
  Tempo di utilizzo possono non arrivare.
- **Efficacia:** nessun blocco è completo (nuovi domini, DNS cifrato del browser, altre reti).
- **Manutenzione:** la lista va aggiornata con ogni versione.
