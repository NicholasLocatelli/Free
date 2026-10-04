import { render } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { ThemeProvider } from "../ui/theme/ThemeProvider";
import type { ThemePreference } from "../ui/theme/tokens";

export function renderWithTheme(ui: ReactElement, preference: ThemePreference = "light") {
  return render(<ThemeProvider initialPreference={preference}>{ui}</ThemeProvider>);
}
