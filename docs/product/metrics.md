# Metriche di prodotto (privacy-safe)

_Owner: Data/Analytics Engineer + Security Engineer. 2026-10-02._

## Regole

1. **Nessun analytics remoto nell'MVP.** Gli eventi sono documentati qui ma l'invio resta spento
   finché la security review (M7) non approva un fornitore/approccio (D-010).
2. Quando verrà attivato: **opt-in esplicito**, eventi **aggregabili e senza contenuto**: niente
   timestamp precisi di impulsi/ricadute, niente intensità, trigger, note, importi, durate.
3. Nessun identificatore pubblicitario, nessun SDK di advertising, nessun fingerprinting.
4. Ogni nuovo evento va aggiunto a questa tabella **prima** dell'implementazione.

## Metriche

| Metrica                      | Definizione                                       | Evento/i                                                              |
| ---------------------------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| Activation                   | % installazioni che completano l'onboarding       | `onboarding_completed`                                                |
| Onboarding completion funnel | Step raggiunti                                    | `onboarding_step_viewed { step }`                                     |
| Weekly engagement            | Settimane con ≥ 1 apertura                        | `app_opened` (contato localmente, inviato come conteggio settimanale) |
| Feature usage                | Uso di SOS, Help Center, storico                  | `feature_used { feature }`                                            |
| Retention                    | Utenti attivi a 7/30/90 giorni                    | derivata da conteggi settimanali                                      |
| Ritorno dopo ricaduta        | % che riapre l'app entro 7 giorni da una ricaduta | `returned_after_relapse_7d` (booleano, nessuna data)                  |
| Goal completion              | % milestone raggiunte                             | `milestone_reached { bucket }` (bucket, non ore esatte)               |

## Esclusi esplicitamente

Contenuto delle note, trigger, intensità, importi spesi o stimati, date di inizio, numero di
ricadute per utente, posizione, contatti.
