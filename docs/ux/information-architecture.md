# Information Architecture & Navigation

_Owner: UX Architect Agent. 2026-10-02._

## Principi

- **3 tab** (non 5): meno scelte sotto stress.
- **Aiuto** sempre a 1 tap: icona nell'header di ogni tab + scorciatoia nella schermata SOS.
- Azioni frequenti (impulso) sulla Home; azioni rare (impostazioni) un livello più in basso.

## Navigation map

```
Root (Expo Router)
├── (onboarding)                 stack, mostrato se non esiste un percorso
│   ├── welcome
│   ├── category
│   ├── start
│   ├── first-goal
│   ├── money
│   └── notifications
├── (tabs)
│   ├── index        "Oggi"      Dashboard
│   ├── history      "Storico"   Lista periodi ──▶ history/[periodId]
│   └── settings     "Impostazioni"
│        ├── goals
│        ├── money
│        ├── notifications
│        ├── appearance
│        └── privacy (export, cancella dati, info)
├── urge/sos         modal full-screen
├── urge/new         modal (form)
├── relapse/confirm  modal ──▶ relapse/reflection
└── help             stack (accessibile da ovunque)
     ├── index
     ├── urge-now
     ├── after-relapse
     ├── professional
     ├── protect-yourself
     ├── emergency
     └── faq
```

## Contenuti per schermata

| Schermata    | Contenuto primario                         | Secondario                                                     |
| ------------ | ------------------------------------------ | -------------------------------------------------------------- |
| Oggi         | Timer periodo corrente, prossima milestone | Stima denaro, "Il tuo percorso" (tempo totale), ultimi impulsi |
| Storico      | Riepilogo cumulativo + periodi             | Filtri (V1)                                                    |
| Impostazioni | Gruppi chiari                              | Versione, fonti, privacy                                       |
| Aiuto        | 6 voci grandi                              | Data di verifica delle risorse                                 |

## Stati trasversali

Empty · Loading (skeleton, < 300 ms tipico, niente spinner bloccanti) · Error (Flow 8) ·
Clock skew · Offline (irrilevante per il core; i link esterni mostrano il numero copiabile).
