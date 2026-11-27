import { getLanguage, type Language } from "../../i18n";
import type { Resource } from "../../ui";
import { COUNTRIES, type CountryCode, type CountryResource } from "./countries";
import { localize } from "./localized";
import { EN_SECTIONS } from "./text/en";
import { IT_SECTIONS } from "./text/it";
import { HELP_SECTION_IDS, type HelpSectionId, type SectionText } from "./text/sections";

export { HELP_SECTION_IDS, type HelpSectionId } from "./text/sections";

/**
 * Help Center content (docs/product/help-center.md): texts in the user's language plus the
 * verified resources and notes of their country. Bundled with the app, so it works offline.
 */
export interface HelpSection extends SectionText {
  id: HelpSectionId;
  resources: readonly Resource[];
}

const TEXTS: Readonly<Record<Language, Readonly<Record<HelpSectionId, SectionText>>>> = {
  it: IT_SECTIONS,
  en: EN_SECTIONS,
};

/** A stored resource in the current language, ready for ResourceCard. */
export function toResource(resource: CountryResource): Resource {
  return {
    name: localize(resource.name),
    description: localize(resource.description),
    ...(resource.hours ? { hours: localize(resource.hours) } : {}),
    ...(resource.phone ? { phone: resource.phone } : {}),
    ...(resource.url ? { url: resource.url } : {}),
    source: resource.source,
    verifiedAt: resource.verifiedAt,
  };
}

/** Sections in display order; without a country, only the language-level guidance. */
export function getHelpSections(country: CountryCode | null): HelpSection[] {
  return HELP_SECTION_IDS.map((id) => buildSection(id, country));
}

export function getHelpSection(id: string, country: CountryCode | null): HelpSection | undefined {
  const known = HELP_SECTION_IDS.find((sectionId) => sectionId === id);
  return known ? buildSection(known, country) : undefined;
}

function buildSection(id: HelpSectionId, country: CountryCode | null): HelpSection {
  const text = TEXTS[getLanguage()][id];
  const help = country ? COUNTRIES[country] : null;
  const notes = help?.notes[id];
  return {
    ...text,
    id,
    body: notes ? [...text.body, ...localize(notes)] : text.body,
    resources: help ? help.resources[id].map(toResource) : [],
  };
}
