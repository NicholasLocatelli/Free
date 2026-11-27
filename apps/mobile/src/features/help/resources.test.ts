/**
 * @jest-environment node
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LANGUAGES, setLanguage } from "../../i18n";
import { ALL_COUNTRY_RESOURCES, COUNTRIES } from "./countries";
import { IT_VERIFIED_AT } from "./countries/italy";
import { getHelpSections } from "./content";

const HELP_CENTER_DOC = readFileSync(
  join(__dirname, "../../../../../docs/product/help-center.md"),
  "utf8",
);
const VERIFICATION_DATE = /Ultima riverifica: (\d{4})-(\d{2})-(\d{2})/;

describe("support resources", () => {
  it.each(ALL_COUNTRY_RESOURCES.map((r) => [r.name.en, r] as const))(
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
    expect(IT_VERIFIED_AT).toBe(documented);
    for (const resource of Object.values(COUNTRIES.IT.resources).flat()) {
      expect(resource.verifiedAt).toBe(documented);
    }
  });

  it("only links to HTTPS pages", () => {
    for (const resource of ALL_COUNTRY_RESOURCES) {
      if (resource.url !== undefined) expect(resource.url).toMatch(/^https:\/\//);
    }
  });

  it.each(Object.values(COUNTRIES).map((c) => [c.code, c] as const))(
    "%s has a callable helpline that is also listed in its resources",
    (_code, country) => {
      expect(country.helpline.phone).toBeDefined();
      expect(Object.values(country.resources).flat()).toContain(country.helpline);
    },
  );

  it("describes every resource in every language", () => {
    for (const resource of ALL_COUNTRY_RESOURCES) {
      for (const language of LANGUAGES) {
        expect(resource.name[language] ?? resource.name.en).not.toBe("");
        expect(resource.description[language] ?? resource.description.en).not.toBe("");
      }
    }
  });
});

describe.each(LANGUAGES)("help content tone (%s)", (language) => {
  afterAll(() => {
    setLanguage("it");
  });
  const sections = () => {
    setLanguage(language);
    return getHelpSections("IT");
  };

  it("contains no shaming or clinical-promise words", () => {
    const allText = sections()
      .flatMap((s) => [
        s.title,
        s.summary,
        ...s.body,
        ...(s.faq ?? []).flatMap((f) => [f.question, f.answer]),
      ])
      .join(" ");
    expect(allText).not.toMatch(
      /fallit|fallimento|colpa|vergogn|guarir|cura definitiva|da zero|failure|failed|shame|your fault|cure/i,
    );
  });

  it("offers at least one resource in every practical section", () => {
    for (const section of sections().filter((s) => !["faq", "about"].includes(s.id))) {
      expect(section.resources.length).toBeGreaterThan(0);
    }
  });
});
