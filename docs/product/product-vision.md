# Product Vision

_Owner: Team A (Product). Ultimo aggiornamento: 2026-10-02._

## Visione

Un compagno discreto e affidabile che, in pochi secondi al giorno, aiuta una persona a **vedere i
propri progressi**, **capire i propri impulsi** e **trovare aiuto reale** quando serve — senza
giudicarla e senza chiederle di cedere i propri dati.

## Problema principale

Chi prova a ridurre o smettere di giocare d'azzardo:

1. **Non vede i progressi.** Senza un riferimento visibile, i giorni senza gioco "spariscono" e la
   motivazione cala.
2. **Vive gli impulsi come imprevedibili.** Non ha modo semplice di notare trigger ricorrenti
   (noia, stress, giorno di paga, eventi sportivi, pubblicità).
3. **Vive la ricaduta come un azzeramento.** I contatori "streak" tradizionali tornano a zero e
   comunicano implicitamente "hai perso tutto": è il momento in cui molti abbandonano lo strumento
   (e talvolta il percorso).
4. **Non sa a chi rivolgersi nel momento critico.** Le risorse ufficiali esistono (es. Telefono Verde
   Nazionale ISS, SerD) ma non sono a portata di mano quando l'impulso arriva.
5. **Teme l'esposizione.** Il tema è stigmatizzante: un'app che chiede account, mostra notifiche
   esplicite o raccoglie dati scoraggia l'uso.

## Utenti target

| Segmento     | Descrizione                                                                                                                                 | Priorità MVP                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Primario** | Adulti (18+) in Italia che hanno deciso di ridurre o smettere di giocare (online o fisico), con o senza un percorso professionale in corso. | ✅                                                        |
| Secondario   | Persone seguite da un SerD/terapeuta che vogliono uno strumento personale di automonitoraggio da affiancare al percorso.                    | ✅ (stesse funzioni)                                      |
| Terziario    | Familiari che cercano risorse.                                                                                                              | ❌ (solo Help Center pubblico, nessuna funzione dedicata) |

Personas dettagliate: [`docs/ux/personas.md`](../ux/personas.md).

**Non target:** minori (l'app non è progettata per loro; l'onboarding lo dichiara), contesti
clinici che richiedono dispositivi medici certificati.

## Proposta di valore

- **Il percorso non si azzera mai:** periodi, milestone e tempo totale restano nello storico.
- **Impulso → azione in 2 tap:** registrare un impulso o aprire tecniche immediate e contatti
  d'aiuto direttamente dalla Home.
- **Privato per default:** nessun account, dati solo sul dispositivo, notifiche neutre.
- **Onesto:** il denaro non speso è una _stima_ dichiarata, disattivabile.

## Cosa NON è

- Non è terapia, diagnosi o sostituto di professionisti sanitari.
- Non è un blocker di siti di gioco (rimandiamo a strumenti ufficiali come l'autoesclusione ADM).
- Non è un social network né una community moderata (rischi di sicurezza e moderazione elevati).

## Metriche di successo (privacy-safe)

Definite in [`metrics.md`](metrics.md): attivazione (onboarding completato), uso settimanale,
uso del pulsante impulso, ritorno all'app dopo una ricaduta registrata (indicatore chiave del
principio "una ricaduta non cancella il percorso").

## Documenti correlati

[Principi](product-principles.md) · [MVP](mvp.md) · [Roadmap](roadmap.md) ·
[Competitive analysis](competitive-analysis.md) · [Obiettivi e motivazione](goals-and-motivation.md) ·
[Help Center](help-center.md)
