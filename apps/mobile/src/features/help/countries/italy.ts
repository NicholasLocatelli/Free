import type { CountryHelp, CountryResource } from "./types";

/**
 * Italy. Verified on the official pages on 2026-11-07, see docs/product/help-center.md.
 */
export const IT_VERIFIED_AT = Date.UTC(2026, 10, 7);

export const TVNGA: CountryResource = {
  name: {
    it: "Telefono Verde Nazionale per le problematiche legate al gioco d'azzardo",
    en: "National gambling helpline (Telefono Verde)",
  },
  description: {
    it: "Psicologi che ascoltano, informano e orientano verso i servizi del territorio. Anche per i familiari.",
    en: "Psychologists who listen, inform and refer you to local services. Also for family members. In Italian.",
  },
  hours: {
    it: "Lunedì–venerdì, 10:00–16:00 · gratuito e anonimo",
    en: "Monday–Friday, 10:00–16:00 · free and anonymous",
  },
  phone: "800 558822",
  url: "https://usciredalgioco.iss.it/en/telefono-verde",
  source: "Istituto Superiore di Sanità",
  verifiedAt: IT_VERIFIED_AT,
};

export const SERVICES_MAP: CountryResource = {
  name: { it: "Mappa dei servizi di cura", en: "Map of treatment services" },
  description: {
    it: "I centri pubblici e del privato sociale per il gioco d'azzardo, con indirizzo e telefono. I servizi pubblici (Ser.D.) sono gratuiti.",
    en: "Public and non-profit gambling treatment centres, with address and phone number. Public services (Ser.D.) are free.",
  },
  url: "https://usciredalgioco.iss.it/",
  source: "Istituto Superiore di Sanità — Uscire dal gioco",
  verifiedAt: IT_VERIFIED_AT,
};

export const GAMBLERS_ANONYMOUS: CountryResource = {
  name: { it: "Giocatori Anonimi Italia", en: "Gamblers Anonymous Italy" },
  description: {
    it: "Gruppi di auto-mutuo aiuto tra persone che vogliono smettere di giocare. Gam-Anon per familiari e amici.",
    en: "Self-help groups for people who want to stop gambling. Gam-Anon for family and friends.",
  },
  phone: "338 1271215",
  url: "https://lnx.giocatorianonimi.org/contatti/",
  source: "Giocatori Anonimi Italia",
  verifiedAt: IT_VERIFIED_AT,
};

export const SELF_EXCLUSION: CountryResource = {
  name: {
    it: "Autoesclusione dal gioco online (RUA)",
    en: "Online gambling self-exclusion (RUA)",
  },
  description: {
    it: "Con SPID puoi escluderti da tutti i siti di gioco con concessione italiana, per 30, 60 o 90 giorni oppure a tempo indeterminato.",
    en: "With SPID you can exclude yourself from all gambling sites licensed in Italy, for 30, 60 or 90 days or indefinitely.",
  },
  url: "https://arserviziam.adm.gov.it/static/ar_rua_static/index.html",
  source: "Agenzia delle Dogane e dei Monopoli",
  verifiedAt: IT_VERIFIED_AT,
};

export const TELEFONO_AMICO: CountryResource = {
  name: { it: "Telefono Amico Italia", en: "Telefono Amico Italia" },
  description: {
    it: "Ascolto per chi vive un momento di solitudine o difficoltà.",
    en: "A listening line for anyone going through loneliness or a hard time. In Italian.",
  },
  hours: {
    it: "Tutti i giorni, 24 ore su 24 · costo di una chiamata a un numero fisso",
    en: "Every day, 24 hours a day · cost of a call to a landline",
  },
  phone: "02 2327 2327",
  url: "https://www.telefonoamico.it/cosa-facciamo/come-contattarci/",
  source: "Telefono Amico Italia",
  verifiedAt: IT_VERIFIED_AT,
};

export const EMERGENCY: CountryResource = {
  name: { it: "Numero Unico di Emergenza", en: "Single emergency number" },
  description: {
    it: "Se tu o qualcun altro siete in pericolo immediato.",
    en: "If you or someone else is in immediate danger.",
  },
  phone: "112",
  source: "Numero di emergenza europeo",
  verifiedAt: IT_VERIFIED_AT,
};

export const ITALY: CountryHelp = {
  code: "IT",
  helpline: TVNGA,
  helplineShortName: { it: "il Telefono Verde", en: "the Telefono Verde" },
  resources: {
    urge: [TVNGA],
    "after-relapse": [TVNGA, GAMBLERS_ANONYMOUS],
    professional: [TVNGA, SERVICES_MAP, GAMBLERS_ANONYMOUS],
    protect: [SELF_EXCLUSION],
    emergency: [EMERGENCY, TELEFONO_AMICO],
    faq: [],
    about: [],
  },
  notes: {
    professional: {
      it: [
        "In Italia esistono servizi specializzati in tutto il territorio. Quelli del Servizio Sanitario Nazionale (Ser.D.) sono gratuiti.",
        "Il Telefono Verde può indicarti il servizio più adatto vicino a te.",
      ],
      en: [
        "In Italy there are specialised services throughout the country. Those of the National Health Service (Ser.D.) are free.",
        "The Telefono Verde helpline can point you to the most suitable service near you.",
      ],
    },
    protect: {
      it: ["• In Italia l'autoesclusione blocca l'accesso a tutti i siti di gioco autorizzati."],
      en: ["• In Italy, self-exclusion blocks access to all licensed gambling sites."],
    },
    emergency: {
      it: ["In Italia il numero unico di emergenza è il 112."],
      en: ["In Italy the single emergency number is 112."],
    },
  },
};
