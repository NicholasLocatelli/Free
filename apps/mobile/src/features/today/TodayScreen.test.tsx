import { createJourney, MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, type Journey } from "@free/core";
import { render, screen } from "@testing-library/react-native";
import { TodayScreen } from "./TodayScreen";

const T0 = Date.UTC(2026, 9, 1, 20, 0);

function journey(): Journey {
  const result = createJourney({
    id: "j",
    periodId: "p",
    categoryId: "gambling",
    startedAt: T0,
    now: T0,
  });
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

describe("TodayScreen", () => {
  it("shows the elapsed time of the current period", async () => {
    const now = T0 + 12 * MS_PER_DAY + 4 * MS_PER_HOUR + 17 * MS_PER_MINUTE;
    await render(<TodayScreen journey={journey()} now={now} />);
    expect(screen.getByText("12 giorni")).toBeOnTheScreen();
    expect(screen.getByLabelText("12 giorni, 4 ore e 17 minuti")).toBeOnTheScreen();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("warns about clock changes instead of showing negative time", async () => {
    await render(<TodayScreen journey={journey()} now={T0 - MS_PER_HOUR} />);
    expect(screen.getByText("0 giorni")).toBeOnTheScreen();
    expect(screen.getByRole("alert")).toBeOnTheScreen();
  });
});
