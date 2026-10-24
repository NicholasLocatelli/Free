import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import type { BackupFiles } from "../../platform/backupFiles";
import { createFakeDeviceAuth } from "../../test/fakeDeviceAuth";
import { createFakeScheduler } from "../../test/fakeScheduler";
import { newJourney, T0 } from "../../test/fixtures";
import { createMemoryRepository, createMemorySettings } from "../../test/memoryRepository";
import { renderApp } from "../../test/renderApp";
import { parseBackup, serializeBackup } from "../backup/backupFormat";
import { APP_LOCK_SETTINGS_KEY } from "../lock/AppLockProvider";
import { PrivacySettingsScreen } from "./PrivacySettingsScreen";

function fakeFiles(picked: string | null = null) {
  const shared: { name: string; contents: string }[] = [];
  const files: BackupFiles = {
    share: (name, contents) => {
      shared.push({ name, contents });
      return Promise.resolve("shared");
    },
    pick: () => Promise.resolve(picked),
  };
  return { files, shared };
}

const press = (name: string) => fireEvent.press(screen.getByRole("button", { name }));

async function setup(
  options: { picked?: string | null; auth?: ReturnType<typeof createFakeDeviceAuth> } = {},
) {
  const { files, shared } = fakeFiles(options.picked ?? null);
  const onDeleted = jest.fn();
  const auth = options.auth ?? createFakeDeviceAuth();
  const scheduler = createFakeScheduler();
  const settings = createMemorySettings({ theme: "dark" });
  const app = await renderApp(
    <PrivacySettingsScreen files={files} onBack={jest.fn()} onDeleted={onDeleted} now={() => T0} />,
    {
      repository: createMemoryRepository(newJourney()),
      settings,
      auth: auth.auth,
      scheduler: scheduler.scheduler,
    },
  );
  return { ...app, shared, onDeleted, auth, scheduler };
}

describe("PrivacySettingsScreen", () => {
  it("exports the journey and portable settings, warning that the file is not encrypted", async () => {
    const { shared } = await setup();
    expect(screen.getByText(/Il file non è cifrato/)).toBeOnTheScreen();
    await press("Esporta in un file");
    expect(await screen.findByText("File pronto. Ricordati dove lo salvi.")).toBeOnTheScreen();
    expect(shared[0]?.name).toBe("approdo-backup-2026-10-01.json");
    expect(parseBackup(shared[0]?.contents ?? "")).toMatchObject({
      ok: true,
      value: { journey: newJourney(), settings: { theme: "dark" } },
    });
  });

  it("imports only after showing what will replace the current data", async () => {
    const other = { ...newJourney(), id: "imported", milestoneHours: [48] };
    const { store } = await setup({
      picked: serializeBackup({ journey: other, settings: {} }, T0),
    });
    await press("Importa da un file");
    expect(await screen.findByText(/Il file contiene 1 periodi e 0 impulsi/)).toBeOnTheScreen();
    expect(store.getState().journey?.id).toBe("journey-1");
    await press("Sostituisci i dati attuali");
    expect(await screen.findByText("Dati importati.")).toBeOnTheScreen();
    expect(store.getState().journey).toEqual(other);
  });

  it("refuses an invalid backup without touching the data", async () => {
    const { store } = await setup({
      picked: '{"format":"approdo-backup","version":1,"journey":{}}',
    });
    await press("Importa da un file");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Il backup contiene dati non validi e non è stato importato.",
    );
    expect(store.getState().journey?.id).toBe("journey-1");
  });

  it("deletes everything only after typing the confirmation word", async () => {
    const { store, onDeleted, scheduler } = await setup();
    const button = screen.getByRole("button", { name: "Cancella definitivamente" });
    expect(button).toBeDisabled();
    await fireEvent.changeText(screen.getByLabelText("Per confermare scrivi CANCELLA"), "CANCELLA");
    await press("Cancella definitivamente");
    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalled();
    });
    // Settings removal is covered by the SQLite integration test (same database).
    expect(store.getState().journey).toBeNull();
    expect(scheduler.state.scheduled).toEqual([]);
  });

  it("turns the lock on after authenticating", async () => {
    const { settings } = await setup();
    await fireEvent.press(screen.getByRole("switch", { name: "Blocca l'app" }));
    await waitFor(async () => {
      expect(await settings.get(APP_LOCK_SETTINGS_KEY)).toBe("on");
    });
  });

  it("explains when the phone has no screen lock", async () => {
    await setup({ auth: createFakeDeviceAuth({ available: false }) });
    await fireEvent.press(screen.getByRole("switch", { name: "Blocca l'app" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/imposta prima un PIN/);
  });
});
