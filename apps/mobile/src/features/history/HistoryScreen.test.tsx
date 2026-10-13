import { MS_PER_DAY, recordRelapse, recordUrge, type Journey } from "@free/core";
import { screen } from "@testing-library/react-native";
import { newJourney, T0 } from "../../test/fixtures";
import { renderWithTheme } from "../../test/render";
import { HistoryScreen } from "./HistoryScreen";

function unwrap(r: { ok: true; value: Journey } | { ok: false; error: string }): Journey {
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

function journeyWithRelapse(): Journey {
  const urged = unwrap(
    recordUrge(newJourney(), {
      id: "u1",
      occurredAt: T0 + MS_PER_DAY,
      intensity: 7,
      outcome: "resisted",
      now: T0 + MS_PER_DAY,
    }),
  );
  return unwrap(
    recordRelapse(urged, {
      relapseId: "r1",
      newPeriodId: "p2",
      occurredAt: T0 + 8 * MS_PER_DAY,
      contributingFactors: ["stress", "sports_event"],
      note: "giorno di paga",
      now: T0 + 8 * MS_PER_DAY,
    }),
  );
}

describe("HistoryScreen", () => {
  it("summarises the whole journey, not only the current period (HIS-1)", async () => {
    await renderWithTheme(
      <HistoryScreen
        journey={journeyWithRelapse()}
        now={T0 + 10 * MS_PER_DAY}
        onBack={jest.fn()}
      />,
    );
    expect(screen.getByLabelText("Tempo totale, 10 giorni")).toBeOnTheScreen();
    expect(screen.getByLabelText("Periodo più lungo, 8 giorni")).toBeOnTheScreen();
    expect(screen.getByLabelText("Impulsi superati, 1")).toBeOnTheScreen();
  });

  it("keeps the closed period with its milestones, factors and note", async () => {
    await renderWithTheme(
      <HistoryScreen
        journey={journeyWithRelapse()}
        now={T0 + 10 * MS_PER_DAY}
        onBack={jest.fn()}
      />,
    );
    expect(screen.getByText("Dal 1 ottobre al 9 ottobre")).toBeOnTheScreen();
    expect(screen.getByText("Traguardi: 1 giorno, 3 giorni, 7 giorni")).toBeOnTheScreen();
    expect(screen.getByText("Cosa ha contribuito: Stress, Evento sportivo")).toBeOnTheScreen();
    expect(screen.getByText("“giorno di paga”")).toBeOnTheScreen();
    expect(screen.getByText("Dal 9 ottobre · In corso")).toBeOnTheScreen();
  });

  it("works for a brand-new journey (HIS-2)", async () => {
    await renderWithTheme(<HistoryScreen journey={newJourney()} now={T0} onBack={jest.fn()} />);
    expect(screen.getByText("Dal 1 ottobre · In corso")).toBeOnTheScreen();
    expect(screen.getByText("Impulsi registrati: 0")).toBeOnTheScreen();
  });
});
