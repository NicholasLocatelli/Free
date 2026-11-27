import type { DurationParts } from "@free/core";
import { count, t } from "./index";

export interface ElapsedText {
  /** Hero value, e.g. "12 giorni". */
  headline: string;
  /** Secondary line, e.g. "4 ore e 17 minuti". */
  detail: string;
  /** Full sentence for screen readers. */
  accessibilityLabel: string;
}

export function formatElapsed({ days, hours, minutes }: DurationParts): ElapsedText {
  const headline = count("day", days);
  const detail = t("elapsed.detail", {
    hours: count("hour", hours),
    minutes: count("minute", minutes),
  });
  return { headline, detail, accessibilityLabel: `${headline}, ${detail}` };
}
