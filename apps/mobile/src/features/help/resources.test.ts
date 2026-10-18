/**
 * @jest-environment node
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { messages } from "../../i18n/it";
import { HELP_SECTIONS } from "./content";
import { ALL_RESOURCES } from "./resources";

const HELP_CENTER_DOC = readFileSync(
  join(__dirname, "../../../../../docs/product/help-center.md"),
  "utf8",
);
const VERIFICATION_DATE = /Ultima riverifica: (\d{4})-(\d{2})-(\d{2})/;

describe("support resources", () => {
  it.each(ALL_RESOURCES.map((r) => [r.name, r] as const))(
    "%s is documented with its number and link in help-center.md",
    (_name, resource) => {
      if (resource.phone !== undefined) expect(HELP_CENTER_DOC).toContain(resource.phone);
      if (resource.url !== undefined) expect(HELP_CENTER_DOC).toContain(resource.url);
    },
  );

  it("shows the same verification date as the documentation", () => {
    const match = VERIFICATION_DATE.exec(HELP_CENTER_DOC);
    expect(match).not.toBeNull();
    const [, y, m, d] = match ?? [];
    const documented = Date.UTC(Number(y), Number(m) - 1, Number(d));
    for (const resource of ALL_RESOURCES) expect(resource.verifiedAt).toBe(documented);
  });

  it("only links to HTTPS pages", () => {
    for (const resource of ALL_RESOURCES) {
      if (resource.url !== undefined) expect(resource.url).toMatch(/^https:\/\//);
    }
  });

  it("uses the same helpline number as the SOS screen copy", () => {
    expect(messages["sos.call"]).toContain("800 558822");
  });
});

describe("help content tone", () => {
  const allText = HELP_SECTIONS.flatMap((s) => [
    s.title,
    s.summary,
    ...s.body,
    ...(s.faq ?? []).flatMap((f) => [f.question, f.answer]),
  ]).join(" ");

  it("contains no shaming or clinical-promise words", () => {
    expect(allText).not.toMatch(/fallit|fallimento|colpa|vergogn|guarir|cura definitiva|da zero/i);
  });

  it("offers at least one resource in every practical section", () => {
    for (const section of HELP_SECTIONS.filter((s) => !["faq", "about"].includes(s.id))) {
      expect(section.resources.length).toBeGreaterThan(0);
    }
  });
});
