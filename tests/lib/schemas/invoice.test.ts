import { describe, it, expect } from "vitest";
import { invoiceSchema } from "@/lib/schemas/invoice";

const valid = {
  appointmentId: "appt-uuid",
  amount: "500",
};

describe("invoiceSchema", () => {
  it("accepts a valid invoice", () => {
    expect(invoiceSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty appointmentId", () => {
    expect(invoiceSchema.safeParse({ ...valid, appointmentId: "" }).success).toBe(false);
  });

  it("rejects an empty amount", () => {
    expect(invoiceSchema.safeParse({ ...valid, amount: "" }).success).toBe(false);
  });

  it("rejects amount of 0", () => {
    expect(invoiceSchema.safeParse({ ...valid, amount: "0" }).success).toBe(false);
  });

  it("rejects negative amount", () => {
    expect(invoiceSchema.safeParse({ ...valid, amount: "-100" }).success).toBe(false);
  });

  it("rejects decimal amount", () => {
    expect(invoiceSchema.safeParse({ ...valid, amount: "99.50" }).success).toBe(false);
  });

  it("rejects non-numeric amount", () => {
    expect(invoiceSchema.safeParse({ ...valid, amount: "abc" }).success).toBe(false);
  });

  it("accepts amount of 1", () => {
    expect(invoiceSchema.safeParse({ ...valid, amount: "1" }).success).toBe(true);
  });

  it("accepts large amount", () => {
    expect(invoiceSchema.safeParse({ ...valid, amount: "99999" }).success).toBe(true);
  });
});
