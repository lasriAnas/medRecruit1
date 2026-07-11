import { describe, it, expect } from "vitest";
import { prescriptionItemSchema } from "@/lib/schemas/prescription";

const valid = {
  medicationName: "Amoxicillin",
  dosage: "500mg",
  duration: "7 days",
};

describe("prescriptionItemSchema", () => {
  it("accepts a valid item", () => {
    expect(prescriptionItemSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional notes", () => {
    expect(
      prescriptionItemSchema.safeParse({ ...valid, notes: "Take after meals" }).success,
    ).toBe(true);
  });

  it("accepts undefined notes", () => {
    expect(prescriptionItemSchema.safeParse({ ...valid, notes: undefined }).success).toBe(true);
  });

  it("rejects empty medicationName", () => {
    expect(prescriptionItemSchema.safeParse({ ...valid, medicationName: "" }).success).toBe(false);
  });

  it("rejects empty dosage", () => {
    expect(prescriptionItemSchema.safeParse({ ...valid, dosage: "" }).success).toBe(false);
  });

  it("rejects empty duration", () => {
    expect(prescriptionItemSchema.safeParse({ ...valid, duration: "" }).success).toBe(false);
  });

  it("allows free-text medication names with spaces and special chars", () => {
    expect(
      prescriptionItemSchema.safeParse({ ...valid, medicationName: "Ibuprofène 400mg (générique)" }).success,
    ).toBe(true);
  });
});
