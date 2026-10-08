import { describe, expect, it } from "vitest";
import { availableCategories, CATEGORIES, getCategory } from "./categories";

describe("categories", () => {
  it("exposes only gambling in the MVP", () => {
    expect(availableCategories().map((c) => c.id)).toEqual(["gambling"]);
  });

  it("declares every planned category as data, not code", () => {
    for (const category of Object.values(CATEGORIES)) {
      expect(getCategory(category.id)).toBe(category);
      expect(category.nameKey).toBe(`category.${category.id}.name`);
      expect(category.defaultMilestoneHours.length).toBeGreaterThan(0);
    }
  });
});
