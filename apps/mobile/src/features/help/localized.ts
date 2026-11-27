import { getLanguage, type Language } from "../../i18n";

/** Text in several languages; English is required and is the fallback for the others. */
export type Localized<T = string> = { readonly en: T } & Partial<Readonly<Record<Language, T>>>;

export const localize = <T>(value: Localized<T>, language: Language = getLanguage()): T =>
  value[language] ?? value.en;
