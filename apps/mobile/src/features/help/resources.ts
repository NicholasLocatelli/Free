import type { Resource } from "../../ui";

/**
 * Official support resources. Every entry must match docs/product/help-center.md (source and
 * verification date); never add a number or service that is not verified there.
 */
export const TVNGA: Resource = {
  name: "Telefono Verde Nazionale per le problematiche legate al gioco d'azzardo",
  description: "Ascolto e orientamento ai servizi, gratuito e anonimo.",
  hours: "Lunedì–venerdì, 10:00–16:00",
  phone: "800 558822",
  source: "Istituto Superiore di Sanità",
  verifiedAt: Date.UTC(2026, 9, 2),
};
