import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AccessibilityInfo, useColorScheme } from "react-native";
import { colors, type ColorScheme, type Theme, type ThemePreference } from "./tokens";

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function resolveScheme(
  preference: ThemePreference,
  system: string | null | undefined,
): ColorScheme {
  if (preference !== "system") return preference;
  return system === "dark" ? "dark" : "light";
}

function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduceMotion(value);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  return reduceMotion;
}

interface ThemeProviderProps {
  children: ReactNode;
  /** Initial preference; persisted by the settings store once it exists (#3). */
  initialPreference?: ThemePreference;
}

export function ThemeProvider({ children, initialPreference = "system" }: ThemeProviderProps) {
  const [preference, setPreference] = useState<ThemePreference>(initialPreference);
  const system = useColorScheme();
  const reduceMotion = useReduceMotion();

  const value = useMemo<ThemeContextValue>(() => {
    const scheme = resolveScheme(preference, system);
    return { theme: { scheme, colors: colors[scheme], reduceMotion }, preference, setPreference };
  }, [preference, system, reduceMotion]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}

export function useTheme(): Theme {
  return useThemeContext().theme;
}
