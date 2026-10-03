import { formatElapsed } from "./formatElapsed";

describe("formatElapsed", () => {
  it("uses Italian singular forms", () => {
    expect(formatElapsed({ days: 1, hours: 1, minutes: 1, seconds: 0 })).toEqual({
      headline: "1 giorno",
      detail: "1 ora e 1 minuto",
      accessibilityLabel: "1 giorno, 1 ora e 1 minuto",
    });
  });

  it("uses Italian plural forms, including zero", () => {
    expect(formatElapsed({ days: 0, hours: 4, minutes: 17, seconds: 59 })).toMatchObject({
      headline: "0 giorni",
      detail: "4 ore e 17 minuti",
    });
  });
});
