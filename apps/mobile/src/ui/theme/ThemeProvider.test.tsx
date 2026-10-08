import { fireEvent, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { resolveScheme, ThemeProvider, useThemeContext } from "./ThemeProvider";

describe("resolveScheme", () => {
  it("follows the system when the preference is 'system'", () => {
    expect(resolveScheme("system", "dark")).toBe("dark");
    expect(resolveScheme("system", "light")).toBe("light");
    expect(resolveScheme("system", null)).toBe("light");
    expect(resolveScheme("system", "unspecified")).toBe("light");
  });

  it("lets an explicit preference win over the system", () => {
    expect(resolveScheme("dark", "light")).toBe("dark");
    expect(resolveScheme("light", "dark")).toBe("light");
  });
});

function Probe() {
  const { theme, setPreference } = useThemeContext();
  return (
    <Text
      onPress={() => {
        setPreference("dark");
      }}
    >
      {`${theme.scheme} ${theme.colors.background}`}
    </Text>
  );
}

describe("ThemeProvider", () => {
  it("switches palette when the preference changes", async () => {
    await render(
      <ThemeProvider initialPreference="light">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByText("light #F7F5F0")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText("light #F7F5F0"));
    expect(screen.getByText("dark #0F1514")).toBeOnTheScreen();
  });

  it("throws a clear error outside the provider", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(render(<Probe />)).rejects.toThrow("useTheme must be used inside <ThemeProvider>");
    spy.mockRestore();
  });
});
