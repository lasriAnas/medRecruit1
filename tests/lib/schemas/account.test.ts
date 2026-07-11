import { describe, it, expect } from "vitest";
import { accountSchema } from "@/lib/schemas/account";

const valid = {
  name: "Dr. Karim Benali",
  email: "karim@clinic.ma",
  role: "DOCTOR" as const,
};

describe("accountSchema", () => {
  it("accepts a valid account", () => {
    expect(accountSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts ADMIN role", () => {
    expect(accountSchema.safeParse({ ...valid, role: "ADMIN" }).success).toBe(true);
  });

  it("accepts RECEPTIONIST role", () => {
    expect(accountSchema.safeParse({ ...valid, role: "RECEPTIONIST" }).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(accountSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects empty email", () => {
    expect(accountSchema.safeParse({ ...valid, email: "" }).success).toBe(false);
  });

  it("rejects malformed email", () => {
    expect(accountSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects invalid role", () => {
    expect(accountSchema.safeParse({ ...valid, role: "NURSE" }).success).toBe(false);
  });
});
