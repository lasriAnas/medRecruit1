import { describe, it, expect } from "vitest";
import { patientSchema } from "@/lib/schemas/patient";

const valid = {
  name: "Fatima Zahra",
  dob: "1990-05-15",
  gender: "FEMALE" as const,
  phone: "0612345678",
};

describe("patientSchema", () => {
  it("accepts a valid patient", () => {
    expect(patientSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts an optional address", () => {
    expect(patientSchema.safeParse({ ...valid, address: "123 Rue Hassan II" }).success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = patientSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty dob", () => {
    const result = patientSchema.safeParse({ ...valid, dob: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid gender", () => {
    const result = patientSchema.safeParse({ ...valid, gender: "OTHER" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone with fewer than 10 digits", () => {
    const result = patientSchema.safeParse({ ...valid, phone: "061234" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone with more than 10 digits", () => {
    const result = patientSchema.safeParse({ ...valid, phone: "06123456789" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone containing non-digit characters", () => {
    const result = patientSchema.safeParse({ ...valid, phone: "061234567a" });
    expect(result.success).toBe(false);
  });

  it("accepts MALE gender", () => {
    expect(patientSchema.safeParse({ ...valid, gender: "MALE" }).success).toBe(true);
  });
});
