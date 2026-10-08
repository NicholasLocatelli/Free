import { contrastRatio } from "./contrast";
import { colors, type ColorScheme, type ColorTokens } from "./tokens";

const AA_TEXT = 4.5;
const AA_NON_TEXT = 3;
const TEXT_TOKENS: readonly (keyof ColorTokens)[] = [
  "text",
  "muted",
  "primary",
  "success",
  "warning",
  "danger",
];
const SCHEMES: readonly ColorScheme[] = ["light", "dark"];

describe.each(SCHEMES)("%s palette", (scheme) => {
  const palette = colors[scheme];

  it.each(TEXT_TOKENS)("%s meets AA on background and surface", (token) => {
    expect(contrastRatio(palette[token], palette.background)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(palette[token], palette.surface)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("button labels meet AA on their fills", () => {
    expect(contrastRatio(palette.onPrimary, palette.primary)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrastRatio(palette.onDanger, palette.danger)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("control outlines meet 3:1 against background and surface", () => {
    expect(contrastRatio(palette.outline, palette.background)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    expect(contrastRatio(palette.outline, palette.surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });
});

describe("contrastRatio", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1);
  });

  it("rejects malformed colors", () => {
    expect(() => contrastRatio("red", "#FFFFFF")).toThrow("Invalid color");
  });
});
