import { useCountryHelp } from "../locale/LocaleProvider";
import type { SosHelpline } from "../sos/SosScreen";
import { localize } from "./localized";

/** The current country's helpline for the urge screen, or null when none is verified. */
export function useSosHelpline(): SosHelpline | null {
  const help = useCountryHelp();
  const phone = help?.helpline.phone;
  if (!help || phone === undefined) return null;
  const hours = help.helpline.hours;
  return {
    name: localize(help.helplineShortName),
    phone,
    ...(hours ? { hours: localize(hours) } : {}),
  };
}
