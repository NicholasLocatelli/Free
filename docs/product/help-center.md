# Help Center — contenuti e risorse

_Owner: A4 Help Center Agent. Prima verifica: 2026-10-02. **Ultima riverifica: 2026-10-18** (M5, issue #6)._

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

Metodo della riverifica 2026-10-18: i siti ufficiali non sono raggiungibili dall'ambiente di
build (proxy), quindi ogni dato è stato confermato tramite l'indice di ricerca **delle pagine
ufficiali** elencate. Prima della Beta (M8) una persona deve aprire ciascun link dal telefono
e confermare (checklist in fondo).

| Risorsa                                                                                                            | Contatto         | In app                                                                     | Fonte (pagina ufficiale)                                                                                                            | Stato al 2026-10-18                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ---------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Telefono Verde Nazionale per le problematiche legate al gioco d'azzardo (TVNGA)** — Istituto Superiore di Sanità | **800 558822**   | Numero, orari lun–ven 10:00–16:00, gratuito e anonimo, anche per familiari | <https://usciredalgioco.iss.it/en/telefono-verde> · <https://www.iss.it/en/-/800-55-88-22telefono-verde-contro-il-gioco-dazzardo-1> | ✅ Numero e orari confermati su più pagine ISS.                                                                                                                                       |
| **Mappa dei servizi di cura** — portale ISS "Uscire dal gioco"                                                     | Web              | Link al portale; nota che i servizi pubblici (Ser.D.) sono gratuiti        | <https://usciredalgioco.iss.it/> · FAQ: <https://usciredalgioco.iss.it/it/faq/>                                                     | ✅ Mappa geolocalizzata dei centri (indirizzo, telefono, ASL); accesso ai servizi pubblici sempre gratuito (FAQ ISS).                                                                 |
| **Giocatori Anonimi Italia** (auto-mutuo aiuto; Gam-Anon per familiari)                                            | **338 1271215**  | Numero del centralino nazionale + pagina contatti                          | <https://lnx.giocatorianonimi.org/contatti/>                                                                                        | ✅ Il numero ora risulta anche sulla pagina contatti del sito ufficiale (in precedenza solo su fonte regionale).                                                                      |
| **Autoesclusione dal gioco a distanza (RUA)** — Agenzia delle Dogane e dei Monopoli                                | Web (SPID)       | Descrizione generale + link; **nessuna durata indicata**                   | <https://arserviziam.adm.gov.it/static/ar_rua_static/index.html>                                                                    | ⚠️ Pagina ufficiale del RUA trovata. Durate e regole di revoca riportate in modo discordante (fonti ADM 2019 vs guide 2026 sul D.Lgs. 41/2024): l'app rimanda alla pagina ufficiale.  |
| **Telefono Amico Italia** (ascolto emotivo)                                                                        | **02 2327 2327** | Numero; **orari non indicati**, rimando al sito                            | <https://www.telefonoamico.it/cosa-facciamo/come-contattarci/>                                                                      | ⚠️ Orari contrastanti: la pagina ufficiale riporta fasce diverse e una notizia locale di settembre 2026 indica servizio 24/7 da settembre. Non mostriamo orari finché non confermati. |
| **Numero Unico di Emergenza**                                                                                      | **112**          | Numero                                                                     | Numero europeo di emergenza (NUE 112)                                                                                               | ✅                                                                                                                                                                                    |

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

- [ ] Aprire dal telefono ogni link della tabella e confermare numero, orari e contenuto; aggiornare la data.
- [ ] Confermare gli orari di Telefono Amico e, se stabili, mostrarli nell'app.
- [ ] Revisione dei testi di auto-aiuto e delle FAQ da parte di un professionista (psicologo o operatore Ser.D.).
