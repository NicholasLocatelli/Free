import type { Resource } from "../../ui";

/**
 * Official support resources shown in the app. Every phone number and URL here MUST also
 * appear in docs/product/help-center.md with its source and verification date; the test
 * `resources.test.ts` enforces it. Never add a number or service that is not verified there.
 */
const VERIFIED_AT = Date.UTC(2026, 9, 18);

export const TVNGA: Resource = {
  name: "Telefono Verde Nazionale per le problematiche legate al gioco d'azzardo",
  description:
    "Psicologi che ascoltano, informano e orientano verso i servizi del territorio. Anche per i familiari.",
  hours: "Lunedì–venerdì, 10:00–16:00 · gratuito e anonimo",
  phone: "800 558822",
  url: "https://usciredalgioco.iss.it/en/telefono-verde",
  source: "Istituto Superiore di Sanità",
  verifiedAt: VERIFIED_AT,
};

export const SERVICES_MAP: Resource = {
  name: "Mappa dei servizi di cura",
  description:
    "I centri pubblici e del privato sociale per il gioco d'azzardo, con indirizzo e telefono. I servizi pubblici (Ser.D.) sono gratuiti.",
  url: "https://usciredalgioco.iss.it/",
  source: "Istituto Superiore di Sanità — Uscire dal gioco",
  verifiedAt: VERIFIED_AT,
};

export const GAMBLERS_ANONYMOUS: Resource = {
  name: "Giocatori Anonimi Italia",
  description:
    "Gruppi di auto-mutuo aiuto tra persone che vogliono smettere di giocare. Gam-Anon per familiari e amici.",
  phone: "338 1271215",
  url: "https://lnx.giocatorianonimi.org/contatti/",
  source: "Giocatori Anonimi Italia",
  verifiedAt: VERIFIED_AT,
};

export const SELF_EXCLUSION: Resource = {
  name: "Autoesclusione dal gioco online (RUA)",
  description:
    "Con SPID puoi escluderti da tutti i siti di gioco con concessione italiana. Durate e condizioni sono indicate nella pagina ufficiale.",
  url: "https://arserviziam.adm.gov.it/static/ar_rua_static/index.html",
  source: "Agenzia delle Dogane e dei Monopoli",
  verifiedAt: VERIFIED_AT,
};

export const TELEFONO_AMICO: Resource = {
  name: "Telefono Amico Italia",
  description:
    "Ascolto per chi vive un momento di solitudine o difficoltà. Gli orari sono indicati sul sito.",
  phone: "02 2327 2327",
  url: "https://www.telefonoamico.it/cosa-facciamo/come-contattarci/",
  source: "Telefono Amico Italia",
  verifiedAt: VERIFIED_AT,
};

export const EMERGENCY: Resource = {
  name: "Numero Unico di Emergenza",
  description: "Se tu o qualcun altro siete in pericolo immediato.",
  phone: "112",
  source: "Numero di emergenza europeo",
  verifiedAt: VERIFIED_AT,
};

export const ALL_RESOURCES: readonly Resource[] = [
  TVNGA,
  SERVICES_MAP,
  GAMBLERS_ANONYMOUS,
  SELF_EXCLUSION,
  TELEFONO_AMICO,
  EMERGENCY,
];
