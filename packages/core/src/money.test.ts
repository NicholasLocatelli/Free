import { describe, expect, it } from "vitest";
import {
  DEFAULT_MONEY_SETTINGS,
  estimateMoneyNotSpent,
  MAX_AMOUNT_PER_SESSION_MINOR,
  validateMoneySettings,
  type MoneySettings,
} from "./money";
import { MS_PER_DAY, MS_PER_WEEK } from "./time";

const weekly: MoneySettings = {
  enabled: true,
  currency: "EUR",
  amountPerSessionMinor: 5_000, // 50.00 EUR
  sessionsPerUnit: 2,
  frequencyUnit: "week",
};

describe("estimateMoneyNotSpent", () => {
  it("projects the baseline over elapsed time", () => {
    expect(estimateMoneyNotSpent(weekly, MS_PER_WEEK)).toEqual({
      status: "estimated",
      amountMinor: 10_000,
      currency: "EUR",
    });
  });

  it("floors partial minor units", () => {
    const result = estimateMoneyNotSpent({ ...weekly, amountPerSessionMinor: 1 }, MS_PER_DAY);
    expect(result).toMatchObject({ amountMinor: 0 });
  });

  it("returns zero at the start of a period", () => {
    expect(estimateMoneyNotSpent(weekly, 0)).toMatchObject({ amountMinor: 0 });
  });

  it("supports daily and monthly frequencies", () => {
    const daily = { ...weekly, frequencyUnit: "day" as const, sessionsPerUnit: 1 };
    expect(estimateMoneyNotSpent(daily, 3 * MS_PER_DAY)).toMatchObject({ amountMinor: 15_000 });
    const monthly = { ...weekly, frequencyUnit: "month" as const, sessionsPerUnit: 1 };
    expect(estimateMoneyNotSpent(monthly, 365.2425 * MS_PER_DAY)).toMatchObject({
      amountMinor: 60_000,
    });
  });

  it("is disabled by default and when switched off", () => {
    expect(estimateMoneyNotSpent(DEFAULT_MONEY_SETTINGS, MS_PER_WEEK).status).toBe("disabled");
    expect(estimateMoneyNotSpent({ ...weekly, enabled: false }, MS_PER_WEEK).status).toBe(
      "disabled",
    );
  });

  it("reports missing values instead of inventing a number", () => {
    const missing = { ...weekly, sessionsPerUnit: null };
    expect(estimateMoneyNotSpent(missing, MS_PER_WEEK).status).toBe("incomplete");
  });

  it("stays a safe integer for extreme values", () => {
    const extreme = {
      ...weekly,
      amountPerSessionMinor: MAX_AMOUNT_PER_SESSION_MINOR,
      sessionsPerUnit: 100,
      frequencyUnit: "day" as const,
    };
    const result = estimateMoneyNotSpent(extreme, 100 * 365 * MS_PER_DAY);
    expect(result.status === "estimated" && Number.isSafeInteger(result.amountMinor)).toBe(true);
  });
});

describe("validateMoneySettings", () => {
  it("accepts a complete baseline", () => {
    expect(validateMoneySettings(weekly).ok).toBe(true);
  });

  it.each([
    [{ currency: "eur" }, "invalid_currency"],
    [{ amountPerSessionMinor: -1 }, "invalid_amount"],
    [{ amountPerSessionMinor: 1.5 }, "invalid_amount"],
    [{ amountPerSessionMinor: MAX_AMOUNT_PER_SESSION_MINOR + 1 }, "invalid_amount"],
    [{ sessionsPerUnit: -1 }, "invalid_frequency"],
    [{ sessionsPerUnit: Number.NaN }, "invalid_frequency"],
    [{ sessionsPerUnit: null }, "missing_baseline"],
  ] as const)("rejects %o with %s", (patch, error) => {
    expect(validateMoneySettings({ ...weekly, ...patch })).toEqual({ ok: false, error });
  });

  it("allows an incomplete baseline while disabled", () => {
    expect(validateMoneySettings(DEFAULT_MONEY_SETTINGS).ok).toBe(true);
  });
});
