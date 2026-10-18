import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { MS_PER_DAY } from "@free/core";
import { RemindersSettingsScreen } from "../settings/RemindersSettingsScreen";
import { createFakeScheduler } from "../../test/fakeScheduler";
import { newJourney, T0 } from "../../test/fixtures";
import { createMemoryRepository, createMemorySettings } from "../../test/memoryRepository";
import { renderApp } from "../../test/renderApp";
import { REMINDER_SETTINGS_KEY, serializePrefs } from "./reminderPlan";

const now = () => T0 + MS_PER_DAY / 2;
const checkIn = () => screen.getByRole("switch", { name: "Promemoria giornaliero" });

describe("reminders", () => {
  it("are off by default and schedule nothing", async () => {
    const { scheduler, state } = createFakeScheduler();
    await renderApp(<RemindersSettingsScreen onBack={jest.fn()} />, {
      repository: createMemoryRepository(newJourney()),
      scheduler,
      now,
    });
    expect(checkIn()).not.toBeChecked();
    await waitFor(() => {
      expect(state.replaceCalls).toBeGreaterThan(0);
    });
    expect(state.scheduled).toEqual([]);
    expect(state.requests).toBe(0);
  });

  it("ask for permission when switched on, then schedule neutral notifications", async () => {
    const { scheduler, state } = createFakeScheduler("granted");
    const settings = createMemorySettings();
    await renderApp(<RemindersSettingsScreen onBack={jest.fn()} />, {
      repository: createMemoryRepository(newJourney()),
      scheduler,
      settings,
      now,
    });
    await fireEvent.press(checkIn());
    await waitFor(() => {
      expect(state.scheduled).toEqual([
        expect.objectContaining({ kind: "check-in", hour: 20, minute: 0 }),
      ]);
    });
    expect(state.requests).toBe(1);
    expect(await settings.get(REMINDER_SETTINGS_KEY)).toContain('"checkInEnabled":true');
  });

  it("stay off and explain when the system permission is denied", async () => {
    const { scheduler, state } = createFakeScheduler("denied");
    await renderApp(<RemindersSettingsScreen onBack={jest.fn()} />, {
      repository: createMemoryRepository(newJourney()),
      scheduler,
      now,
    });
    await fireEvent.press(checkIn());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Le notifiche sono disattivate per questa app nelle impostazioni del telefono.",
    );
    expect(checkIn()).not.toBeChecked();
    expect(state.scheduled).toEqual([]);
    expect(
      screen.getByRole("button", { name: "Apri le impostazioni del telefono" }),
    ).toBeOnTheScreen();
  });

  it("restore saved choices at startup and re-plan after a relapse", async () => {
    const { scheduler, state } = createFakeScheduler("granted");
    await scheduler.requestPermission();
    const settings = createMemorySettings({
      [REMINDER_SETTINGS_KEY]: serializePrefs({
        checkInEnabled: false,
        checkInTime: "20:00",
        milestonesEnabled: true,
      }),
    });
    const { store } = await renderApp(<RemindersSettingsScreen onBack={jest.fn()} />, {
      repository: createMemoryRepository(newJourney()),
      scheduler,
      settings,
      now,
    });
    await waitFor(() => {
      expect(state.scheduled[0]?.id).toBe("milestone-period-1-24");
    });
    await act(async () => {
      await store.getState().recordRelapse({ occurredAt: now() });
    });
    await waitFor(() => {
      expect(state.scheduled[0]?.id).toMatch(/^milestone-id-\d+-24$/);
    });
    expect(state.scheduled.filter((n) => n.id.startsWith("milestone-period-1"))).toEqual([]);
  });
});
