/** Languages the app is translated into. Italian is the source; see docs/product/localization.md. */
export const LANGUAGES = ["it", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

/** Used when the phone is set to a language the app does not have yet. */
export const FALLBACK_LANGUAGE: Language = "en";

/** Formatting conventions (dates, numbers) for each language. */
export const INTL_LOCALES: Readonly<Record<Language, string>> = { it: "it-IT", en: "en-GB" };

/** Each language is shown in its own name, so it can be found by someone who reads only it. */
export const LANGUAGE_NAMES: Readonly<Record<Language, string>> = {
  it: "Italiano",
  en: "English",
};

export const isLanguage = (value: unknown): value is Language =>
  typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);

/** First of the phone's preferred languages that the app supports, else the fallback. */
export function resolveLanguage(preferred: readonly (string | null | undefined)[]): Language {
  return preferred.find(isLanguage) ?? FALLBACK_LANGUAGE;
}
