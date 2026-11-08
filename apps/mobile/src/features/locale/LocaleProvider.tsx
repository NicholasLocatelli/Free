import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isLanguage, resolveLanguage, setLanguage, type Language } from "../../i18n";
import { useSettings } from "../../state/SettingsProvider";
import { COUNTRIES, detectCountry, isCountryCode, type CountryCode } from "../help/countries";

export const LANGUAGE_SETTINGS_KEY = "language";
export const COUNTRY_SETTINGS_KEY = "country";

export type LanguagePreference = "system" | Language;
/** "auto": the phone's region; "none": a country without verified resources. */
export type CountryPreference = "auto" | "none" | CountryCode;

export interface DeviceLocale {
  /** Preferred language codes, most preferred first ("it", "en", ...). */
  languages: readonly (string | null)[];
  /** Region code such as "IT" or "GB". */
  region: string | null;
}

interface LocaleContextValue {
  language: Language;
  languagePreference: LanguagePreference;
  setLanguagePreference: (preference: LanguagePreference) => void;
  /** Country whose verified resources are shown, or null when none are available. */
  country: CountryCode | null;
  countryPreference: CountryPreference;
  setCountryPreference: (preference: CountryPreference) => void;
  /** Re-reads saved preferences (after a backup import). */
  reload: () => Promise<void>;
  /** Back to the phone's language and region (after "delete all data"). */
  reset: () => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const parseLanguage = (raw: string | null): LanguagePreference =>
  isLanguage(raw) ? raw : "system";
const parseCountry = (raw: string | null): CountryPreference =>
  raw === "none" || isCountryCode(raw) ? raw : "auto";

interface LocaleProviderProps {
  /** The phone's language and region; injected for tests. */
  device: () => DeviceLocale;
  children: ReactNode;
}

/**
 * Language and country of the app. They are separate on purpose: the language decides the
 * texts, the country decides which numbers and services are shown (an English speaker may
 * live anywhere). A country without verified resources never falls back to another one's.
 */
export function LocaleProvider({ device, children }: LocaleProviderProps) {
  const settings = useSettings();
  const [deviceLocale] = useState(device);
  const [languagePreference, setLanguageState] = useState<LanguagePreference>("system");
  const [countryPreference, setCountryState] = useState<CountryPreference>("auto");

  const read = useCallback(
    () =>
      Promise.all([
        settings.get(LANGUAGE_SETTINGS_KEY).catch(() => null),
        settings.get(COUNTRY_SETTINGS_KEY).catch(() => null),
      ]),
    [settings],
  );

  const reload = useCallback(async () => {
    const [language, country] = await read();
    setLanguageState(parseLanguage(language));
    setCountryState(parseCountry(country));
  }, [read]);

  useEffect(() => {
    let active = true;
    read()
      .then(([language, country]) => {
        if (!active) return;
        setLanguageState(parseLanguage(language));
        setCountryState(parseCountry(country));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [read]);

  const language =
    languagePreference === "system" ? resolveLanguage(deviceLocale.languages) : languagePreference;
  // Set before the children render, so every screen and formatter uses it.
  setLanguage(language);

  const country =
    countryPreference === "auto"
      ? detectCountry(deviceLocale.region)
      : countryPreference === "none"
        ? null
        : countryPreference;

  const setLanguagePreference = useCallback(
    (preference: LanguagePreference) => {
      setLanguageState(preference);
      settings.set(LANGUAGE_SETTINGS_KEY, preference).catch(() => undefined);
    },
    [settings],
  );

  const setCountryPreference = useCallback(
    (preference: CountryPreference) => {
      setCountryState(preference);
      settings.set(COUNTRY_SETTINGS_KEY, preference).catch(() => undefined);
    },
    [settings],
  );

  const reset = useCallback(() => {
    setLanguageState("system");
    setCountryState("auto");
  }, []);

  const value = useMemo(
    () => ({
      language,
      languagePreference,
      setLanguagePreference,
      country,
      countryPreference,
      setCountryPreference,
      reload,
      reset,
    }),
    [
      language,
      languagePreference,
      setLanguagePreference,
      country,
      countryPreference,
      setCountryPreference,
      reload,
      reset,
    ],
  );
  return <LocaleContext value={value}>{children}</LocaleContext>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside <LocaleProvider>");
  return context;
}

/** The country's verified help, or null. */
export function useCountryHelp() {
  const { country } = useLocale();
  return country ? COUNTRIES[country] : null;
}
