# Build Android con EAS

Guida per creare la versione installabile dell'app (APK) con EAS Build, il servizio di Expo che
compila l'app nel cloud. Serve per provare ciò che Expo Go non supporta (protezioni dei backup,
permessi reali, nome e icona dell'app) e per la beta.

## Cosa serve

- Un account Expo (gratuito): <https://expo.dev/signup>. Il piano gratuito ha un numero limitato
  di build al mese e una coda condivisa: i dettagli aggiornati sono su <https://expo.dev/pricing>.
- Un telefono Android (o un emulatore Android) per installare l'APK.
- Il progetto aggiornato sul PC.

## Profili (`apps/mobile/eas.json`)

| Profilo       | Per cosa                                                                    | Risultato                                    |
| ------------- | --------------------------------------------------------------------------- | -------------------------------------------- |
| `preview`     | Provare l'app come la userà un utente: nessun server di sviluppo            | APK da installare                            |
| `development` | Sviluppo con ricarica dal PC, come Expo Go ma con il codice nativo dell'app | APK + `pnpm --filter @free/mobile start:dev` |
| `production`  | Pubblicazione sul Play Store (più avanti)                                   | AAB per Google Play                          |

## Prima build (Windows, Prompt dei comandi)

1. Aggiorna il progetto:

   ```
   cd C:\Users\progr\Free
   git checkout main
   git pull
   pnpm install
   ```

2. Entra nella cartella dell'app e accedi a Expo:

   ```
   cd apps\mobile
   npx eas-cli@latest login
   ```

3. Collega il progetto al tuo account (una sola volta):

   ```
   npx eas-cli@latest init
   ```

   Il comando crea il progetto su expo.dev e aggiunge `extra.eas.projectId` e `owner` in
   `app.json`. Fai commit e push di questa modifica (oppure dimmelo e la porto io in una PR).

4. Avvia la build di prova:

   ```
   npx eas-cli@latest build --platform android --profile preview
   ```

   - Alla domanda sulla chiave di firma (keystore) rispondi di sì: EAS la genera e la conserva.
     La stessa chiave servirà per gli aggiornamenti sul Play Store, quindi non va persa.
   - La build gira nel cloud (di solito qualche decina di minuti, di più se la coda è lunga).
     Alla fine il terminale e la pagina su expo.dev mostrano un link e un QR code.

5. Installa l'APK sul telefono Android: apri il link dal telefono, scarica il file e consenti
   l'installazione da questa fonte quando Android lo chiede.

## Build di sviluppo (facoltativa)

```
npx eas-cli@latest build --platform android --profile development
```

Installa l'APK come sopra, poi dal PC avvia il server con
`pnpm --filter @free/mobile start:dev` e apri il progetto dall'app installata. Il comando
abituale `pnpm --filter @free/mobile start` continua ad aprire Expo Go.

## Cosa verificare sulla build

- Nome "Free" sotto l'icona.
- Impostazioni Android → App → Free → Autorizzazioni: solo notifiche (dopo averle attivate);
  nessun accesso ad archivio o sovrapposizione ad altre app.
- Promemoria: attivali e controlla che arrivino con testi diversi nei giorni successivi.
- Blocco app con impronta o PIN; anteprima nascosta tra le app recenti; screenshot bloccati.
- Il testbook completo, ripetuto sulla build invece che su Expo Go.

## Identificativo dell'app

`com.nicholaslocatelli.free` (in `app.json`). Si può cambiare liberamente finché l'app non viene
caricata sul Play Store; dopo il primo caricamento è definitivo.
