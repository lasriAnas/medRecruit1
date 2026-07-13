import { describe, it, expect } from "vitest";
import { restockSchema } from "@/lib/schemas/restock";

const valid = {
  medicationId: "med-uuid",
  quantity: "10",
};

describe("restockSchema", () => {
  it("accepts a valid restock", () => {
    expect(restockSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty medicationId", () => {
    expect(restockSchema.safeParse({ ...valid, medicationId: "" }).success).toBe(false);
  });

  it("rejects quantity of 0", () => {
    expect(restockSchema.safeParse({ ...valid, quantity: "0" }).success).toBe(false);
  });

  it("rejects negative quantity", () => {
    expect(restockSchema.safeParse({ ...valid, quantity: "-5" }).success).toBe(false);
  });

  it("rejects non-integer quantity", () => {
    expect(restockSchema.safeParse({ ...valid, quantity: "2.5" }).success).toBe(false);
  });

  it("rejects non-numeric quantity", () => {
    expect(restockSchema.safeParse({ ...valid, quantity: "abc" }).success).toBe(false);
  });

  it("accepts quantity of 1", () => {
    expect(restockSchema.safeParse({ ...valid, quantity: "1" }).success).toBe(true);
  });

  it("accepts large quantity", () => {
    expect(restockSchema.safeParse({ ...valid, quantity: "10000" }).success).toBe(true);
  });

  it("coerces string quantity to number", () => {
    const result = restockSchema.safeParse(valid);
    expect(result.success && result.data.quantity).toBe(10);
  });
});
