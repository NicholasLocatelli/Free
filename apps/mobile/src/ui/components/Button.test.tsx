import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithTheme } from "../../test/render";
import { Button } from "./Button";

describe("Button", () => {
  it("exposes role, label and calls onPress", async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button label="Ho un impulso" onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "Ho un impulso" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire when disabled", async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button label="Salva" disabled onPress={onPress} />);
    await fireEvent.press(screen.getByRole("button", { name: "Salva" }));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Salva" })).toBeDisabled();
  });

  it("ignores repeated taps while an async action is pending (double tap)", async () => {
    let resolve: () => void = () => undefined;
    const onPress = jest.fn(() => new Promise<void>((r) => (resolve = r)));
    await renderWithTheme(<Button label="Salva" onPress={onPress} />);
    const button = screen.getByRole("button", { name: "Salva" });

    await fireEvent.press(button);
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button).toBeBusy();

    resolve();
    await screen.findByText("Salva");
    expect(button).not.toBeBusy();
  });

  it.each(["primary", "secondary", "tertiary", "destructive"] as const)(
    "renders the %s variant in dark mode",
    async (variant) => {
      await renderWithTheme(
        <Button label="Azione" variant={variant} onPress={jest.fn()} />,
        "dark",
      );
      expect(screen.getByText("Azione")).toBeOnTheScreen();
    },
  );
});
