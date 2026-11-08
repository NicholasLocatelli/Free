import type { Instant } from "@free/core";
import type { HelpSectionId } from "../text/sections";
import type { Localized } from "../localized";

/**
 * A support resource as stored: texts in several languages. Numbers and links MUST be
 * documented, with source and verification date, in docs/product/help-center.md
 * (enforced by resources.test.ts). Never add an unverified number.
 */
export interface CountryResource {
  name: Localized;
  description: Localized;
  hours?: Localized;
  phone?: string;
  url?: string;
  /** Organisation that publishes the information (proper name, not translated). */
  source: string;
  verifiedAt: Instant;
}

/** Everything the app shows that depends on the user's country rather than language. */
export interface CountryHelp {
  code: string;
  /** Called from the urge screen and offered after a relapse. */
  helpline: CountryResource;
  /** Short name for the urge screen button, e.g. "Telefono Verde". */
  helplineShortName: Localized;
  resources: Readonly<Record<HelpSectionId, readonly CountryResource[]>>;
  /** Country-specific paragraphs appended to a section ("• " marks a list item). */
  notes: Partial<Readonly<Record<HelpSectionId, Localized<readonly string[]>>>>;
}
