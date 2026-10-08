import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithTheme } from "../../test/render";
import { Chip } from "./Chip";
import { TextField } from "./TextField";
import { Toggle } from "./Toggle";

describe("TextField", () => {
  it("has a visible label, a counter and forwards changes", async () => {
    const onChangeText = jest.fn();
    await renderWithTheme(
      <TextField label="Nota" value="ciao" onChangeText={onChangeText} maxLength={2000} />,
    );
    expect(screen.getByText("4/2000")).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText("Nota"), "ciao!");
    expect(onChangeText).toHaveBeenCalledWith("ciao!");
  });

  it("shows errors as text", async () => {
    await renderWithTheme(
      <TextField label="Importo" value="x" onChangeText={jest.fn()} error="Inserisci un numero" />,
    );
    expect(screen.getByText("Inserisci un numero")).toBeOnTheScreen();
  });
});

describe("Chip", () => {
  it("uses checkbox semantics for multi-select", async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Chip label="Noia" selected onPress={onPress} />);
    const chip = screen.getByRole("checkbox", { name: "Noia" });
    expect(chip).toBeChecked();
    await fireEvent.press(chip);
    expect(onPress).toHaveBeenCalled();
  });

  it("uses radio semantics for single select", async () => {
    await renderWithTheme(
      <Chip label="Scuro" selection="single" selected={false} onPress={jest.fn()} />,
    );
    expect(screen.getByRole("radio", { name: "Scuro" })).not.toBeSelected();
  });
});

describe("Toggle", () => {
  it("toggles from anywhere on the row and reports its state", async () => {
    const onValueChange = jest.fn();
    await renderWithTheme(
      <Toggle label="Stima del denaro" value={false} onValueChange={onValueChange} />,
    );
    const toggle = screen.getByRole("switch", { name: "Stima del denaro" });
    expect(toggle).not.toBeChecked();
    await fireEvent.press(toggle);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});
