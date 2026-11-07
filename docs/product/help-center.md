# Help Center — contenuti e risorse

_Owner: A4 Help Center Agent. Prima verifica: 2026-10-02. **Ultima riverifica: 2026-11-07** (issue #17)._

> Le risorse mostrate nell'app sono in `apps/mobile/src/features/help/resources.ts`. Il test
> `resources.test.ts` fallisce se un numero o un link dell'app non compare in questa pagina.

## Regole

1. **Non inventare** numeri, associazioni, servizi o informazioni sanitarie.
2. Solo fonti **ufficiali/istituzionali** o organizzazioni riconosciute.
3. Ogni risorsa ha: URL fonte, data di verifica, stato.
4. **Gate di rilascio:** prima della Beta (M8) ogni risorsa va ri-verificata aprendo direttamente
   la fonte ufficiale (vedi "Stato verifica"); i testi di auto-aiuto vanno rivisti da un
   professionista (psicologo/SerD). Issue dedicata in M5.
5. Il Help Center è raggiungibile dalla Home in **1 tap** e funziona **offline** (contenuti inclusi
   nell'app; i link esterni si aprono nel browser).

## Risorse (Italia)

Metodo della riverifica 2026-11-07: ogni pagina ufficiale elencata è stata scaricata
direttamente (non da un indice di ricerca) e il testo confrontato con quello dell'app. L'owner
aveva già aperto dal telefono ogni link e numero (testbook HLP-09, HLP-10, ottobre 2026).

| Risorsa                                                                                                            | Contatto         | In app                                                                     | Fonte (pagina ufficiale)                                                        | Stato al 2026-11-07                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------ | ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Telefono Verde Nazionale per le problematiche legate al gioco d'azzardo (TVNGA)** — Istituto Superiore di Sanità | **800 558822**   | Numero, orari lun–ven 10:00–16:00, gratuito e anonimo, anche per familiari | <https://usciredalgioco.iss.it/en/telefono-verde>                               | ✅ La pagina riporta "servizio nazionale, anonimo e gratuito, attivo dal lunedì al venerdì dalle ore 10:00 alle ore 16:00".                                                                                                                                 |
| **Mappa dei servizi di cura** — portale ISS "Uscire dal gioco"                                                     | Web              | Link al portale; nota che i servizi pubblici (Ser.D.) sono gratuiti        | <https://usciredalgioco.iss.it/> · FAQ: <https://usciredalgioco.iss.it/it/faq/> | ✅ La home offre "Scopri tutti i Centri per la cura del disturbo da gioco d'azzardo in Italia — Cerca Centro".                                                                                                                                              |
| **Giocatori Anonimi Italia** (auto-mutuo aiuto; Gam-Anon per familiari)                                            | **338 1271215**  | Numero del centralino nazionale + pagina contatti                          | <https://lnx.giocatorianonimi.org/contatti/>                                    | ✅ "Centralino nazionale: 338-1271215".                                                                                                                                                                                                                     |
| **Autoesclusione dal gioco a distanza (RUA)** — Agenzia delle Dogane e dei Monopoli                                | Web (SPID)       | Con SPID; 30, 60 o 90 giorni oppure a tempo indeterminato; link            | <https://arserviziam.adm.gov.it/static/ar_rua_static/index.html>                | ✅ La pagina riporta credenziali SPID e "un periodo determinato (30, 60 o 90 giorni) o a tempo indeterminato"; revoca solo per l'indeterminato, dopo almeno sei mesi.                                                                                       |
| **Telefono Amico Italia** (ascolto emotivo)                                                                        | **02 2327 2327** | Numero; tutti i giorni, 24 ore su 24; costo di una chiamata a un fisso     | <https://www.telefonoamico.it/cosa-facciamo/come-contattarci/>                  | ✅ "Tutti i giorni ... 24 ore su 24"; servizio gratuito ma "il costo della chiamata dipende dal singolo operatore (equivale ad una chiamata ad un telefono fisso nazionale)". WhatsApp Amico (324 011 72 52, tutti i giorni 18–21) non è mostrato nell'app. |
| **Numero Unico di Emergenza**                                                                                      | **112**          | Numero                                                                     | Numero europeo di emergenza (NUE 112)                                           | ✅                                                                                                                                                                                                                                                          |

Fonti secondarie consultate (non usate come fonte primaria): <https://www.issalute.it/index.php/numeri-verdi/gioco-d-azzardo>,
<https://www.adnkronos.com/cronaca/rua-e-autoesclusione-adm-nel-2026-guida-pratica-per-capire-come-funziona-e-quando-usarla_uES7sFLPqvGtW3oK1zCBa>,
<https://www.sulpanaro.net/2026/09/telefono-amico-2-654-contatti-nei-primi-6-mesi-del-2026-servizio-ora-attivo-giorno-e-notte/>.

**Logica "emergenza":** la sezione "Se sei in pericolo" mostra 112 e Telefono Amico. Non usiamo
linguaggio clinico; non facciamo valutazioni del rischio.

## Struttura del Help Center (MVP)

1. **Ho un impulso adesso** → tecniche immediate (sotto) + "Chiama il Telefono Verde" + "Registra
   l'impulso".
2. **Ho giocato / dopo una ricaduta** → cosa puoi fare ora, perché lo storico resta, risorse.
3. **Trova aiuto professionale** → TVNGA, mappa servizi ISS, Giocatori Anonimi.
4. **Strumenti per proteggerti** → autoesclusione ADM, gestione del denaro (es. limiti con la
   propria banca — testo generico, nessun consiglio finanziario personalizzato).
5. **Se sei in pericolo** → 112, Telefono Amico.
6. **FAQ** → sotto.
7. **Informazioni sull'app** → non è terapia; privacy; fonti e data di verifica.

## Tecniche immediate (bozza — revisione professionale richiesta prima della Beta)

Strategie generali di auto-aiuto, presentate come suggerimenti, non prescrizioni:

- **Aspetta 15 minuti.** Gli impulsi tendono a salire, raggiungere un picco e scendere. Avvia il
  timer guidato e osserva l'impulso senza agire.
- **Respira lentamente.** Esercizio guidato di un minuto (animazione disattivabile con "riduci
  movimento").
- **Cambia ambiente.** Esci, cammina, allontanati dal dispositivo o dal luogo di gioco.
- **Contatta qualcuno.** Una persona di fiducia o il Telefono Verde (800 558822, lun–ven 10–16).
- **Ricorda le tue ragioni.** Mostra la nota "Perché ho iniziato" (se l'utente l'ha scritta).
- **Allontana il denaro.** Rendi più difficile l'accesso immediato a soldi/carte.

## FAQ (bozza)

- **Questa app è una terapia?** No. È uno strumento personale. Per un supporto professionale
  rivolgiti ai servizi elencati.
- **Se ricado perdo tutto?** No. Il periodo precedente resta nello storico con le sue milestone.
- **Chi vede i miei dati?** Nessuno: restano sul tuo dispositivo. Puoi cancellarli in ogni momento.
- **Il denaro mostrato è reale?** È una stima basata su quanto ci hai indicato; puoi disattivarla.
- **Posso cambiare la data di inizio?** Sì, dalle impostazioni del percorso.

## Gate prima della Beta (richiede persone)

- [x] Aprire dal telefono ogni link della tabella (testbook HLP-09/10) e riverificare le pagine ufficiali; data aggiornata al 2026-11-07.
- [x] Confermare gli orari di Telefono Amico e mostrarli nell'app (24/7, costo di una chiamata a un fisso).
- [ ] Ripetere la riverifica subito prima della pubblicazione sugli store.
- [ ] Revisione dei testi di auto-aiuto e delle FAQ da parte di un professionista (psicologo o operatore Ser.D.).
