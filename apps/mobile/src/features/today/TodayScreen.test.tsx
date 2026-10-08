import { createJourney, MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, type Journey } from "@free/core";
import { screen } from "@testing-library/react-native";
import { renderWithTheme } from "../../test/render";
import { TodayScreen } from "./TodayScreen";

const T0 = Date.UTC(2026, 9, 1, 20, 0);

function journey(extra: Partial<Parameters<typeof createJourney>[0]> = {}): Journey {
  const result = createJourney({
    id: "j",
    periodId: "p",
    categoryId: "gambling",
    startedAt: T0,
    now: T0,
    ...extra,
  });
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

describe("TodayScreen", () => {
  it("shows the elapsed time of the current period", async () => {
    const now = T0 + 12 * MS_PER_DAY + 4 * MS_PER_HOUR + 17 * MS_PER_MINUTE;
    await renderWithTheme(<TodayScreen journey={journey()} now={now} />);
    expect(screen.getByText("12 giorni")).toBeOnTheScreen();
    expect(screen.getByLabelText("12 giorni, 4 ore e 17 minuti")).toBeOnTheScreen();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(
      screen.getByRole("progressbar", { name: "Prossimo obiettivo: 14 giorni" }),
    ).toBeOnTheScreen();
    expect(screen.queryByText("Stima del denaro non speso")).toBeNull();
  });

  it("warns about clock changes instead of showing negative time", async () => {
    await renderWithTheme(<TodayScreen journey={journey()} now={T0 - MS_PER_HOUR} />);
    expect(screen.getByText("0 giorni")).toBeOnTheScreen();
    expect(screen.getByRole("alert")).toBeOnTheScreen();
  });

  it("shows the first day state", async () => {
    await renderWithTheme(<TodayScreen journey={journey()} now={T0 + 5 * MS_PER_MINUTE} />);
    expect(screen.getByLabelText("0 giorni, 0 ore e 5 minuti")).toBeOnTheScreen();
    expect(screen.getByText("Prossimo obiettivo: 1 giorno")).toBeOnTheScreen();
    expect(screen.getByText("Dal 1 ottobre alle ore 22:00")).toBeOnTheScreen();
  });

  it("acknowledges when every goal is reached", async () => {
    await renderWithTheme(
      <TodayScreen journey={journey({ milestoneHours: [24] })} now={T0 + 2 * MS_PER_DAY} />,
    );
    expect(screen.getAllByText("Hai raggiunto tutti i tuoi obiettivi.")).toHaveLength(1);
    expect(
      screen.getByRole("progressbar", { name: "Hai raggiunto tutti i tuoi obiettivi." }),
    ).toHaveAccessibilityValue({ now: 100 });
  });

  it("labels the money figure as an estimate", async () => {
    const withMoney = journey({
      money: {
        enabled: true,
        currency: "EUR",
        amountPerSessionMinor: 2_000,
        sessionsPerUnit: 1,
        frequencyUnit: "day",
      },
    });
    await renderWithTheme(<TodayScreen journey={withMoney} now={T0 + 3 * MS_PER_DAY} />);
    expect(
      screen.getByLabelText("Stima del denaro non speso, ~ 60 €, Basata su quanto ci hai indicato"),
    ).toBeOnTheScreen();
  });
});
