/** Help Center sections, in display order. */
export const HELP_SECTION_IDS = [
  "urge",
  "after-relapse",
  "professional",
  "protect",
  "emergency",
  "faq",
  "about",
] as const;
export type HelpSectionId = (typeof HELP_SECTION_IDS)[number];

/** The part of a section that depends only on the language. */
export interface SectionText {
  title: string;
  summary: string;
  /** Paragraphs; a leading "• " marks a list item. */
  body: readonly string[];
  faq?: readonly { question: string; answer: string }[];
}
