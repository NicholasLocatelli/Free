import { screen } from "@testing-library/react-native";
import { renderWithTheme } from "../../test/render";
import { clampProgress, ProgressRing } from "./ProgressRing";

describe("ProgressRing", () => {
  it("is announced as a progress bar with a percentage value", async () => {
    await renderWithTheme(<ProgressRing value={0.426} accessibilityLabel="Verso 7 giorni" />);
    const ring = screen.getByRole("progressbar", { name: "Verso 7 giorni" });
    expect(ring).toHaveAccessibilityValue({ min: 0, max: 100, now: 43 });
  });

  it.each([
    [-1, 0],
    [0.5, 0.5],
    [2, 1],
    [Number.NaN, 0],
  ])("clamps %s to %s", (input, expected) => {
    expect(clampProgress(input)).toBe(expected);
  });
});
