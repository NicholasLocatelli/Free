import { formatGoal, formatMoney, spellDigits } from "./format";
import { messages, t } from "./it";

describe("t", () => {
  it("interpolates placeholders and leaves unknown ones visible", () => {
    expect(t("urge.resisted", { n: 3 })).toBe("Hai superato un impulso. Sono 3 finora.");
    expect(t("urge.resisted")).toBe("Hai superato un impulso. Sono {n} finora.");
  });
});

describe("tone of voice", () => {
  it("never uses shaming or clinical-promise words", () => {
    const forbidden = /fallit|fallimento|hai perso|reset|da zero|guarir|jackpot/i;
    for (const text of Object.values(messages)) expect(text).not.toMatch(forbidden);
  });
});

describe("format", () => {
  it("formats goals in days or hours", () => {
    expect(formatGoal(24)).toBe("1 giorno");
    expect(formatGoal(168)).toBe("7 giorni");
    expect(formatGoal(36)).toBe("36 ore");
    expect(formatGoal(1)).toBe("1 ora");
  });

  it("formats money in whole euros", () => {
    expect(formatMoney(34_099, "EUR").replace(/\s/g, " ")).toBe("340 €");
  });

  it("spells phone numbers digit by digit", () => {
    expect(spellDigits("800 558822")).toBe("8 0 0 5 5 8 8 2 2");
  });
});
