import { describe, it, expect } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("produces a header row followed by data rows", () => {
    const result = toCsv(
      [{ Name: "Alice", Age: 30 }],
      ["Name", "Age"],
    );
    expect(result).toBe("Name,Age\nAlice,30");
  });

  it("uses empty string for missing column values", () => {
    const result = toCsv([{ Name: "Bob" }], ["Name", "Age"]);
    expect(result).toBe("Name,Age\nBob,");
  });

  it("wraps values containing commas in double quotes", () => {
    const result = toCsv([{ Label: "a,b" }], ["Label"]);
    expect(result).toBe('Label\n"a,b"');
  });

  it("wraps values containing double quotes and escapes them", () => {
    const result = toCsv([{ Label: 'say "hi"' }], ["Label"]);
    expect(result).toBe('Label\n"say ""hi"""');
  });

  it("wraps values containing newlines in double quotes", () => {
    const result = toCsv([{ Notes: "line1\nline2" }], ["Notes"]);
    expect(result).toBe('Notes\n"line1\nline2"');
  });

  it("handles multiple rows in order", () => {
    const result = toCsv(
      [
        { A: 1, B: 2 },
        { A: 3, B: 4 },
      ],
      ["A", "B"],
    );
    expect(result).toBe("A,B\n1,2\n3,4");
  });

  it("returns only the header when rows is empty", () => {
    const result = toCsv([], ["X", "Y"]);
    expect(result).toBe("X,Y");
  });

  it("converts numeric values to strings", () => {
    const result = toCsv([{ Amount: 1500 }], ["Amount"]);
    expect(result).toBe("Amount\n1500");
  });
});
