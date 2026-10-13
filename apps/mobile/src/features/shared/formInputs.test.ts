import { formatMinorForInput, moneyInputFromSettings, parseMoneyInput } from "./formInputs";

describe("money input", () => {
  it.each([
    [5000, "50"],
    [1250, "12,50"],
    [1205, "12,05"],
    [0, "0"],
  ])("formats %i cents as %s", (minor, text) => {
    expect(formatMinorForInput(minor)).toBe(text);
  });

  it("round-trips stored settings through the form", () => {
    const settings = {
      enabled: true,
      currency: "EUR",
      amountPerSessionMinor: 1250,
      sessionsPerUnit: 1.5,
      frequencyUnit: "week" as const,
    };
    const input = moneyInputFromSettings(settings);
    expect(input).toEqual({
      enabled: true,
      amount: "12,50",
      sessions: "1,5",
      frequencyUnit: "week",
    });
    expect(parseMoneyInput(input)).toEqual({ ok: true, value: settings });
  });

  it("shows empty fields when no baseline was given", () => {
    expect(
      moneyInputFromSettings({
        enabled: false,
        currency: "EUR",
        amountPerSessionMinor: null,
        sessionsPerUnit: null,
        frequencyUnit: "week",
      }),
    ).toEqual({ enabled: false, amount: "", sessions: "", frequencyUnit: "week" });
  });

  it("keeps a valid baseline when the estimate is switched off", () => {
    expect(
      parseMoneyInput({ enabled: false, amount: "20", sessions: "2", frequencyUnit: "day" }),
    ).toEqual({
      ok: true,
      value: {
        enabled: false,
        currency: "EUR",
        amountPerSessionMinor: 2000,
        sessionsPerUnit: 2,
        frequencyUnit: "day",
      },
    });
  });

  it("does not block switching off with incomplete fields", () => {
    expect(
      parseMoneyInput({ enabled: false, amount: "abc", sessions: "", frequencyUnit: "week" }),
    ).toMatchObject({ ok: true, value: { enabled: false, amountPerSessionMinor: null } });
  });

  it("requires both fields when enabled", () => {
    expect(
      parseMoneyInput({ enabled: true, amount: "", sessions: "2", frequencyUnit: "week" }),
    ).toEqual({ ok: false, error: "invalid_amount" });
    expect(
      parseMoneyInput({ enabled: true, amount: "5", sessions: "0", frequencyUnit: "week" }),
    ).toEqual({ ok: false, error: "invalid_sessions" });
  });
});
