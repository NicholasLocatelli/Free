# Lingue e paesi

_Owner: Product + Engineering. Introdotto il 2026-11-08 (D-029)._

## Due scelte separate

| Scelta     | Decide                                                         | Default                                             | Dove si cambia        |
| ---------- | -------------------------------------------------------------- | --------------------------------------------------- | --------------------- |
| **Lingua** | Tutti i testi, i formati di date e numeri, i plurali           | Prima lingua del telefono supportata, se no inglese | Impostazioni → Lingua |
| **Paese**  | Numeri, servizi, siti e note locali dell'Aiuto (SOS, ricaduta) | Regione del telefono, se ha risorse verificate      | Impostazioni → Paese  |

Sono separate perché la lingua non dice dove si trova una persona (un inglese può vivere in
Italia). **Un paese senza risorse verificate non ne mostra di altri paesi**: l'app lo dice e
invita a chiamare il numero di emergenza locale.

## Stato

| Lingua   | Interfaccia | Testi dell'Aiuto | Revisione                                                                     |
| -------- | ----------- | ---------------- | ----------------------------------------------------------------------------- |
| Italiano | ✅ sorgente | ✅               | Revisione professionale dei testi di aiuto (#17)                              |
| English  | ✅          | ✅               | Owner (inglese buono, non madrelingua); madrelingua prima della pubblicazione |
| Français | ⏳          | ⏳               | Madrelingua prima della pubblicazione                                         |
| Español  | ⏳          | ⏳               | Madrelingua prima della pubblicazione                                         |

| Paese       | Risorse verificate               |
| ----------- | -------------------------------- |
| Italia      | ✅ 2026-11-07 (`help-center.md`) |
| Regno Unito | ⏳                               |
| Francia     | ⏳                               |
| Spagna      | ⏳                               |

## Dove stanno i testi

- `apps/mobile/src/i18n/it.ts`: catalogo sorgente. Ogni altra lingua (`en.ts`, …) deve avere
  le stesse chiavi (lo impone il tipo) e gli stessi segnaposto `{nome}` (test).
- Plurali: chiavi `unit.<unità>.one|other`, scelte con `Intl.PluralRules` della lingua.
- Aiuto: `features/help/text/<lingua>.ts` (consigli validi ovunque) e
  `features/help/countries/<paese>.ts` (risorse e note locali, testi in più lingue con
  l'inglese obbligatorio come riserva).
- Notifiche: chiavi `notification.*`, ripianificate quando cambia la lingua.

## Aggiungere una lingua

1. Aggiungere il codice in `i18n/languages.ts` (`LANGUAGES`, `INTL_LOCALES`, `LANGUAGE_NAMES`).
2. Creare `i18n/<lingua>.ts` con tutte le chiavi e `features/help/text/<lingua>.ts`.
3. Aggiungere le traduzioni delle risorse dei paesi già presenti (facoltative: senza, si usa
   l'inglese).
4. `pnpm check`: i test controllano segnaposto, tono e notifiche neutre in ogni lingua.
5. Revisione di un madrelingua prima della pubblicazione.

## Aggiungere un paese

1. Verificare ogni risorsa sulla pagina ufficiale (regole in `help-center.md`: mai numeri
   inventati, fonte e data per ogni voce) e documentarla lì.
2. Creare `features/help/countries/<paese>.ts` con helpline principale, risorse per sezione e
   note locali (numero di emergenza, autoesclusione, servizi pubblici).
3. Registrarlo in `countries/index.ts` e aggiungere il nome del paese (`country.<CODICE>`) in
   ogni catalogo.

## Limiti noti

- La stima del denaro è solo in euro: va aggiunta la scelta della valuta prima di supportare
  il Regno Unito.
- Cambiare lingua riporta alla schermata Oggi (le schermate vengono ricreate nella nuova lingua).
