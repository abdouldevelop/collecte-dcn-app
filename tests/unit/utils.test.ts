import { formatDate, getDaysRemaining, parseDecimal, slugify } from "@/lib/utils";

describe("formatDate", () => {
  it("formats a valid date", () => {
    const result = formatDate("2024-01-15");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("returns dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });
});

describe("getDaysRemaining", () => {
  it("returns null for null input", () => {
    expect(getDaysRemaining(null)).toBeNull();
  });

  it("returns positive for future date", () => {
    const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const days = getDaysRemaining(future);
    expect(days).toBeGreaterThan(0);
  });

  it("returns negative for past date", () => {
    const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const days = getDaysRemaining(past);
    expect(days).toBeLessThan(0);
  });
});

describe("parseDecimal", () => {
  it("parses string number", () => {
    expect(parseDecimal("123.45")).toBe(123.45);
  });

  it("returns null for empty string", () => {
    expect(parseDecimal("")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(parseDecimal(null)).toBeNull();
  });

  it("returns null for NaN string", () => {
    expect(parseDecimal("not-a-number")).toBeNull();
  });
});

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes accents", () => {
    expect(slugify("Déclaration")).toBe("declaration");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("Import Export")).toBe("import-export");
  });
});
