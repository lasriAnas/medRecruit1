import { describe, it, expect } from "vitest";
import { medicationSchema } from "@/lib/schemas/medication";

const valid = {
  name: "Paracetamol",
  unit: "tablet",
  stock: "100",
  reorderThreshold: "20",
  category: "MEDICATION" as const,
};

describe("medicationSchema", () => {
  it("accepts a valid medication", () => {
    expect(medicationSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts category SUPPLY", () => {
    expect(medicationSchema.safeParse({ ...valid, category: "SUPPLY" }).success).toBe(true);
  });

  it("rejects an invalid category", () => {
    expect(medicationSchema.safeParse({ ...valid, category: "OTHER" }).success).toBe(false);
  });

  it("rejects missing category", () => {
    const { category: _, ...withoutCategory } = valid;
    expect(medicationSchema.safeParse(withoutCategory).success).toBe(false);
  });

  it("accepts a valid supply item", () => {
    expect(
      medicationSchema.safeParse({
        name: "Latex gloves (M)",
        unit: "pair",
        stock: "200",
        reorderThreshold: "50",
        category: "SUPPLY",
      }).success,
    ).toBe(true);
  });

  it("rejects empty name", () => {
    expect(medicationSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects empty unit", () => {
    expect(medicationSchema.safeParse({ ...valid, unit: "" }).success).toBe(false);
  });

  it("accepts stock of 0", () => {
    expect(medicationSchema.safeParse({ ...valid, stock: "0" }).success).toBe(true);
  });

  it("rejects non-integer stock", () => {
    expect(medicationSchema.safeParse({ ...valid, stock: "10.5" }).success).toBe(false);
  });

  it("rejects negative stock", () => {
    expect(medicationSchema.safeParse({ ...valid, stock: "-5" }).success).toBe(false);
  });

  it("rejects reorderThreshold of 0", () => {
    expect(medicationSchema.safeParse({ ...valid, reorderThreshold: "0" }).success).toBe(false);
  });

  it("rejects negative reorderThreshold", () => {
    expect(medicationSchema.safeParse({ ...valid, reorderThreshold: "-1" }).success).toBe(false);
  });

  it("accepts reorderThreshold of 1", () => {
    expect(medicationSchema.safeParse({ ...valid, reorderThreshold: "1" }).success).toBe(true);
  });

  it("rejects non-numeric stock", () => {
    expect(medicationSchema.safeParse({ ...valid, stock: "ten" }).success).toBe(false);
  });
});
