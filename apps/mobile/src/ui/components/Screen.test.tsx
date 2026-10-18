import { screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import { renderWithTheme } from "../../test/render";
import { Screen } from "./Screen";

const NOTCH = { top: 47, bottom: 34, left: 0, right: 0 };

describe("Screen", () => {
  it("keeps content clear of the notch and home indicator", async () => {
    await renderWithTheme(
      <SafeAreaInsetsContext value={NOTCH}>
        <Screen>
          <Text>Oggi</Text>
        </Screen>
      </SafeAreaInsetsContext>,
    );
    expect(screen.getByText("Oggi")).toBeOnTheScreen();
    const style: unknown = screen.getByTestId("screen").props.contentContainerStyle;
    const flatStyle = [style].flat(3);
    expect(flatStyle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ paddingTop: 47 + 24, paddingBottom: 34 + 24 }),
      ]),
    );
  });
});
