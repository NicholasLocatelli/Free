import type { DurationParts } from "@free/core";

import { plural } from "./format";

export interface ElapsedText {
  /** Hero value, e.g. "12 giorni". */
  headline: string;
  /** Secondary line, e.g. "4 ore e 17 minuti". */
  detail: string;
  /** Full sentence for screen readers. */
  accessibilityLabel: string;
}

export function formatElapsed({ days, hours, minutes }: DurationParts): ElapsedText {
  const headline = plural(days, "giorno", "giorni");
  const detail = `${plural(hours, "ora", "ore")} e ${plural(minutes, "minuto", "minuti")}`;
  return { headline, detail, accessibilityLabel: `${headline}, ${detail}` };
}
