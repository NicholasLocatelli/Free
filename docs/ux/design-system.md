# Design System

_Owner: A2 Style/Brand Agent + UI Designer Agent + Accessibility Agent. Versione 0.2 — 2026-10-04._

**Implementazione (issue #2):** token in `apps/mobile/src/ui/theme/tokens.ts`, tema in
`ThemeProvider.tsx` (Sistema/Chiaro/Scuro + "Riduci movimento"), componenti in
`apps/mobile/src/ui/components/`, copy in `apps/mobile/src/i18n/it.ts`. I contrasti di questa
pagina sono verificati da `tokens.test.ts`: una modifica della palette che viola AA fa fallire la
CI. Catalogo visivo (solo build di sviluppo): route `/dev/catalog`.

## 1. Brand

**Nome di lavoro: _Approdo_** — il luogo sicuro dove si arriva dopo una navigazione difficile.
Italiano, calmo, non clinico, nessuna associazione al gioco. Alternative valutate: _Riva_, _Varco_,
_Free_ (nome del repo: troppo generico e in conflitto con marchi telco noti). ⚠️ Verifica marchio
e disponibilità sugli store = decisione umana prima della Beta (D-002).

**Discrezione:** nome e icona non menzionano il gioco. Icona: forma astratta (orizzonte/approdo),
nessuna fiche, carta, dado, moneta, trifoglio, "7".

**Personalità:** calmo · adulto · caldo · essenziale · affidabile.
**Non è:** casinò, neon, oro/viola "premium gambling", jackpot, confetti, gamer.

## 2. Tono di voce

| Regola                                       | Esempio ✅                                   | Da evitare ❌                        |
| -------------------------------------------- | -------------------------------------------- | ------------------------------------ |
| Seconda persona, informale ma rispettosa     | "Come ti senti adesso?"                      | "L'utente deve…"                     |
| Continuità, non azzeramento                  | "Il percorso continua."                      | "Ricomincia da zero."                |
| Descrivere, non giudicare                    | "Hai registrato una ricaduta."               | "Hai fallito." / "Ci sei ricascato." |
| Onestà sui numeri                            | "Stima del denaro non speso"                 | "Hai risparmiato 500 €!"             |
| Nessuna promessa clinica                     | "Uno strumento per seguire il tuo percorso." | "Guarisci dalla dipendenza."         |
| Frasi brevi (≤ 15 parole), un'idea per frase |                                              | Paragrafi densi sotto stress         |
| Emoji: no nel copy di sistema                |                                              | 🎰💰🔥                               |

### Microcopy di riferimento

| Contesto                         | Testo                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------- |
| Pulsante impulso                 | **Ho un impulso**                                                               |
| Pulsante ricaduta                | **Registra una ricaduta** (D-009)                                               |
| SOS titolo                       | Questo momento passerà. Proviamo insieme.                                       |
| Impulso superato                 | Hai superato un impulso. Sono {n} finora.                                       |
| Dopo ricaduta                    | Il percorso continua.                                                           |
| Milestone                        | Hai raggiunto {n} giorni. Prenditi un momento per riconoscerlo.                 |
| Stima denaro                     | Stima del denaro non speso · basata su quanto ci hai indicato                   |
| Notifica milestone (lock screen) | "Hai un nuovo traguardo." (mai il tema)                                         |
| Notifica check-in                | "Un momento per te?"                                                            |
| Empty storico                    | Il tuo storico crescerà con te.                                                 |
| Clock skew                       | L'ora del dispositivo sembra cambiata. Il conteggio riprenderà automaticamente. |

## 3. Colori

Palette "acqua calma": verde-salvia profondo + neutri caldi. Contrasti calcolati (WCAG 2.x) sul
background e sulla surface; tutti i colori di testo ≥ 4.5:1.

### Light

| Token        | Hex       | Uso                                                            | Contrasto (bg / surface) |
| ------------ | --------- | -------------------------------------------------------------- | ------------------------ |
| `background` | `#F7F5F0` | Sfondo app                                                     | —                        |
| `surface`    | `#FFFFFF` | Card, sheet                                                    | —                        |
| `text`       | `#1C2826` | Testo primario                                                 | 13.96 / 15.21            |
| `muted`      | `#56635F` | Testo secondario, caption                                      | 5.76 / 6.28              |
| `primary`    | `#2F6B5E` | Azioni primarie, anello                                        | 5.69 / 6.20              |
| `onPrimary`  | `#FFFFFF` | Testo su primary                                               | 6.20 su primary          |
| `success`    | `#2E7046` | Milestone raggiunte                                            | 5.47 / 5.96              |
| `warning`    | `#8A5A00` | Avvisi (clock skew)                                            | 5.44 / 5.93              |
| `danger`     | `#B3261E` | **Solo** azioni distruttive (cancella dati). Mai per ricadute. | 6.00 / 6.54              |
| `border`     | `#D9D4C9` | Divisori decorativi                                            | —                        |
| `outline`    | `#7A8582` | Bordo input/controlli (≥ 3:1 non-text)                         | 3.50 / 3.81              |

### Dark

| Token        | Hex       | Contrasto (bg / surface) |
| ------------ | --------- | ------------------------ |
| `background` | `#0F1514` | —                        |
| `surface`    | `#18201F` | —                        |
| `text`       | `#ECEFEC` | 15.93 / 14.33            |
| `muted`      | `#A3AFAC` | 8.16 / 7.34              |
| `primary`    | `#7FC4B1` | 9.17 / 8.25              |
| `onPrimary`  | `#0B2620` | 7.95 su primary          |
| `success`    | `#7BC79A` | 9.21 / 8.28              |
| `warning`    | `#E8B86A` | 10.10 / 9.09             |
| `danger`     | `#F2A39D` | 9.23 / 8.30              |
| `border`     | `#2C3735` | —                        |
| `outline`    | `#6B7A77` | 4.11 / 3.70              |

Modalità: **Sistema** (default) · Chiaro · Scuro (persistito in impostazioni).

## 4. Tipografia

Font di sistema (SF Pro / Roboto): nessun download, ottimo supporto Dynamic Type, nessun
tracciamento da font CDN. Tutte le dimensioni scalano con le impostazioni di accessibilità
(`allowFontScaling` sempre attivo; layout testati fino a 200%).

| Token        | Size / Line height | Peso                                 | Uso                         |
| ------------ | ------------------ | ------------------------------------ | --------------------------- |
| `display`    | 34 / 41            | 700                                  | Titoli schermata principali |
| `timer`      | 56 / 64            | 600, `fontVariant: ['tabular-nums']` | Giorni nel timer            |
| `heading`    | 22 / 28            | 600                                  | Titoli sezione/card         |
| `body`       | 17 / 24            | 400                                  | Testo                       |
| `bodyStrong` | 17 / 24            | 600                                  | Enfasi, label pulsanti      |
| `caption`    | 13 / 18            | 400                                  | Note, fonti, metadati       |

## 5. Spaziatura, forme, elevazione, movimento

- **Spacing scale (px):** 4 · 8 · 12 · 16 · 24 · 32 · 48. Margine schermata 16 (24 su tablet).
- **Radius:** `sm` 8 (chip, input) · `md` 16 (card, pulsanti) · `lg` 24 (sheet) · `full` (anelli, avatar).
- **Elevazione:** ombre minime in light; in dark si usa `surface` più chiara invece dell'ombra.
- **Touch target:** minimo 48×48 dp; pulsanti primari 56 dp di altezza.
- **Movimento:** transizioni 200–250 ms ease-out; nessuna animazione infinita; con "Riduci
  movimento" attivo le animazioni diventano dissolvenze o vengono rimosse (anello statico,
  respirazione con conteggio testuale).

## 6. Iconografia

Set lineare coerente (stroke 1.75–2 px, angoli arrotondati), es. Lucide. **Rinviato a M4**:
nessun componente M2 richiede icone (stati e azioni sono sempre espressi in testo); la libreria
verrà scelta con il primo flusso che ne ha bisogno, verificandone la licenza. Simboli: bussola/orizzonte (brand), onda, foglia, cuore, telefono, libro, scudo.
**Vietati:** dadi, carte, fiches, slot, monete che cadono, trofei dorati, fiamme "streak".

## 7. Componenti (contratto per M2)

| Componente              | Varianti / stati                                                                                 | Accessibilità                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Button**              | primary · secondary (outline) · tertiary (testo) · destructive; default/pressed/disabled/loading | `accessibilityRole="button"`, label esplicita, disabilitato durante submit (anti doppio tap)         |
| **Card**                | default · interactive                                                                            | Se interattiva: ruolo button, area tap intera                                                        |
| **ProgressRing**        | value 0..1, size, label centrale                                                                 | `accessibilityRole="progressbar"` + `accessibilityValue {min,max,now}`; statico con riduci movimento |
| **Timer**               | days + h/min; aggiornamento ogni minuto (secondi non mostrati: meno ansia, meno batteria)        | Annuncio leggibile: "12 giorni, 4 ore e 17 minuti"; nessun live-region a ogni tick                   |
| **Stat**                | label, valore, caption opzionale ("stima")                                                       | Label+valore letti insieme                                                                           |
| **Chart** (V1)          | bar settimanale impulsi                                                                          | Tabella alternativa testuale                                                                         |
| **Modal / BottomSheet** | con titolo, chiusura esplicita                                                                   | Focus trap, chiusura con gesture e pulsante                                                          |
| **Input**               | testo, numero (importo), multiline (nota con contatore)                                          | Label visibile, errori testuali (non solo colore)                                                    |
| **Slider/Scale 1–10**   | 10 step discreti                                                                                 | Valori annunciati, alternativa a pulsanti                                                            |
| **Chip**                | single/multi select                                                                              | `accessibilityState.selected`                                                                        |
| **Checkbox / Switch**   | on/off/disabled                                                                                  | Ruolo nativo                                                                                         |
| **EmptyState**          | icona, titolo, testo, CTA opzionale                                                              | —                                                                                                    |
| **ErrorState**          | titolo, spiegazione, azioni (Riprova…)                                                           | Mai solo icona                                                                                       |
| **MilestoneCard**       | reached · next · future                                                                          | Stato espresso in testo ("raggiunto il 3 ottobre")                                                   |
| **ResourceCard**        | nome, descrizione, orari, CTA chiama/apri, fonte + data verifica                                 | Numero leggibile cifra per cifra                                                                     |

## 8. Checklist accessibilità (Accessibility Agent)

- [ ] Contrasto testo ≥ 4.5:1, non-text ≥ 3:1 (token sopra) in light e dark
- [ ] Touch target ≥ 48 dp
- [ ] Font scaling fino a 200% senza testo troncato nei flussi critici
- [ ] Label/ruoli/stati per screen reader (VoiceOver, TalkBack) su ogni controllo
- [ ] Ordine di focus logico; modali con focus trap
- [ ] Riduci movimento rispettato
- [ ] Informazioni mai trasmesse solo con il colore
- [ ] Accessibilità cognitiva: un compito per schermata, linguaggio semplice, nessun timeout
