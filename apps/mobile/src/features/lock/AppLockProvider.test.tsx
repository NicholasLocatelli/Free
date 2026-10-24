import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { AppState, Text, type AppStateStatus } from "react-native";
import { createFakeDeviceAuth } from "../../test/fakeDeviceAuth";
import { createMemorySettings } from "../../test/memoryRepository";
import { renderApp } from "../../test/renderApp";
import { APP_LOCK_SETTINGS_KEY } from "./AppLockProvider";

function captureAppState() {
  let listener: ((state: AppStateStatus) => void) | undefined;
  jest.spyOn(AppState, "addEventListener").mockImplementation((_type, handler) => {
    listener = handler;
    return { remove: jest.fn() };
  });
  return (state: AppStateStatus) => {
    listener?.(state);
  };
}

describe("app lock", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("is off by default and shows the app", async () => {
    await renderApp(<Text>Contenuto privato</Text>);
    expect(await screen.findByText("Contenuto privato")).toBeOnTheScreen();
    expect(screen.queryByRole("header", { name: "App bloccata" })).toBeNull();
  });

  it("hides the content at launch until the owner authenticates", async () => {
    const { auth, state } = createFakeDeviceAuth({ passes: false });
    await renderApp(<Text>Contenuto privato</Text>, {
      auth,
      settings: createMemorySettings({ [APP_LOCK_SETTINGS_KEY]: "on" }),
    });
    expect(await screen.findByRole("header", { name: "App bloccata" })).toBeOnTheScreen();
    expect(screen.queryByText("Contenuto privato")).toBeNull(); // hidden from assistive tech
    expect(state.protection).toBe(true);

    state.passes = true;
    await fireEvent.press(screen.getByRole("button", { name: "Sblocca" }));
    expect(await screen.findByText("Contenuto privato")).toBeOnTheScreen();
  });

  it("locks again when the app goes to the background", async () => {
    const emit = captureAppState();
    const { auth } = createFakeDeviceAuth({ passes: true });
    await renderApp(<Text>Contenuto privato</Text>, {
      auth,
      settings: createMemorySettings({ [APP_LOCK_SETTINGS_KEY]: "on" }),
    });
    await screen.findByText("Contenuto privato");
    auth.authenticate = () => Promise.resolve(false);
    await act(async () => {
      emit("background");
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(screen.getByRole("header", { name: "App bloccata" })).toBeOnTheScreen();
    });
  });
});
