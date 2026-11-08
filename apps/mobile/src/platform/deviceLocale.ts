import { getLocales } from "expo-localization";
import type { DeviceLocale } from "../features/locale/LocaleProvider";

/** The phone's preferred languages and region, read once at startup. */
export function readDeviceLocale(): DeviceLocale {
  try {
    const locales = getLocales();
    return {
      languages: locales.map((l) => l.languageCode),
      region: locales.at(0)?.regionCode ?? null,
    };
  } catch {
    return { languages: [], region: null };
  }
}
