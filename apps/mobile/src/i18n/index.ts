import { en } from "./en";
import { messages as it, type MessageKey } from "./it";
import { INTL_LOCALES, type Language } from "./languages";

export type { MessageKey } from "./it";
export * from "./languages";

const CATALOGS: Readonly<Record<Language, Readonly<Record<MessageKey, string>>>> = { it, en };

/**
 * The language in use. Module state rather than React context, so plain functions
 * (formatters, notification planning) translate too; LocaleProvider sets it before the
 * screens render and remounts them when it changes. Italian until then (and in tests).
 */
let current: Language = "it";

export function setLanguage(language: Language): void {
  current = language;
}

export const getLanguage = (): Language => current;

export const intlLocale = (): string => INTL_LOCALES[current];

export function t(key: MessageKey, vars: Readonly<Record<string, string | number>> = {}): string {
  return CATALOGS[current][key].replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}

export function hasMessage(key: string): key is MessageKey {
  return Object.hasOwn(it, key);
}

const pluralRules = new Map<string, Intl.PluralRules>();

/**
 * "one" or "other". Uses Intl.PluralRules where the JavaScript engine has it; otherwise the
 * rule shared by the supported languages (1 is singular), which keeps the app working on
 * engines without it.
 */
function pluralForm(n: number): "one" | "other" {
  if (typeof Intl.PluralRules !== "function") return n === 1 ? "one" : "other";
  const locale = intlLocale();
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRules.set(locale, rules);
  }
  return rules.select(n) === "one" ? "one" : "other";
}

export type CountedUnit = "day" | "hour" | "minute" | "period" | "urge";

/** "1 giorno", "3 giorni", "1 day": the plural form follows the language's own rules. */
export function count(unit: CountedUnit, n: number): string {
  return t(`unit.${unit}.${pluralForm(n)}`, { n });
}
