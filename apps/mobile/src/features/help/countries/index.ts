import { ITALY } from "./italy";
import type { CountryHelp } from "./types";

export type { CountryHelp, CountryResource } from "./types";

/** Countries with verified sources of help. Add one only after verifying every resource. */
export const COUNTRIES = { IT: ITALY } as const satisfies Readonly<Record<string, CountryHelp>>;
export type CountryCode = keyof typeof COUNTRIES;
export const COUNTRY_CODES = Object.keys(COUNTRIES) as CountryCode[];

export const isCountryCode = (value: unknown): value is CountryCode =>
  typeof value === "string" && Object.hasOwn(COUNTRIES, value);

/** The phone's region, if the app has verified resources for it. */
export function detectCountry(region: string | null | undefined): CountryCode | null {
  const code = region?.toUpperCase();
  return isCountryCode(code) ? code : null;
}

/** Every stored resource, for the consistency test with docs/product/help-center.md. */
export const ALL_COUNTRY_RESOURCES = Object.values(COUNTRIES).flatMap((country) => [
  country.helpline,
  ...Object.values(country.resources).flat(),
]);
