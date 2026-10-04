import type { TextStyle } from "react-native";

/**
 * Design tokens from docs/ux/design-system.md. Contrast ratios are asserted in
 * tokens.test.ts, so a palette change that breaks WCAG AA fails CI.
 */
export interface ColorTokens {
  background: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  onPrimary: string;
  success: string;
  warning: string;
  danger: string;
  onDanger: string;
  border: string;
  outline: string;
}

export type ColorScheme = "light" | "dark";
export type ThemePreference = "system" | ColorScheme;

export const colors: Readonly<Record<ColorScheme, ColorTokens>> = {
  light: {
    background: "#F7F5F0",
    surface: "#FFFFFF",
    text: "#1C2826",
    muted: "#56635F",
    primary: "#2F6B5E",
    onPrimary: "#FFFFFF",
    success: "#2E7046",
    warning: "#8A5A00",
    danger: "#B3261E",
    onDanger: "#FFFFFF",
    border: "#D9D4C9",
    outline: "#7A8582",
  },
  dark: {
    background: "#0F1514",
    surface: "#18201F",
    text: "#ECEFEC",
    muted: "#A3AFAC",
    primary: "#7FC4B1",
    onPrimary: "#0B2620",
    success: "#7BC79A",
    warning: "#E8B86A",
    danger: "#F2A39D",
    onDanger: "#3B0A07",
    border: "#2C3735",
    outline: "#6B7A77",
  },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 8, md: 16, lg: 24, full: 999 } as const;

/** Minimum touch target (dp) for any interactive element. */
export const MIN_TOUCH_TARGET = 48;
/** Height of primary actions such as "Ho un impulso". */
export const PRIMARY_BUTTON_HEIGHT = 56;

export const motion = { durationMs: 220 } as const;

export type TypographyVariant = "display" | "timer" | "heading" | "body" | "bodyStrong" | "caption";

export const typography: Readonly<Record<TypographyVariant, TextStyle>> = {
  display: { fontSize: 34, lineHeight: 41, fontWeight: "700" },
  timer: { fontSize: 56, lineHeight: 64, fontWeight: "600", fontVariant: ["tabular-nums"] },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: "600" },
  body: { fontSize: 17, lineHeight: 24, fontWeight: "400" },
  bodyStrong: { fontSize: 17, lineHeight: 24, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
};

export interface Theme {
  scheme: ColorScheme;
  colors: ColorTokens;
  reduceMotion: boolean;
}
