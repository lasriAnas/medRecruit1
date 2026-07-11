import { describe, it, expect } from "vitest";
import { appointmentSchema } from "@/lib/schemas/appointment";

const FUTURE = "2099-01-01T10:00:00";

const valid = {
  patientId: "patient-uuid",
  doctorId: "doctor-uuid",
  scheduledAt: FUTURE,
};

describe("appointmentSchema", () => {
  it("accepts a valid appointment", () => {
    expect(appointmentSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional notes", () => {
    expect(appointmentSchema.safeParse({ ...valid, notes: "bring previous scans" }).success).toBe(true);
  });

  it("rejects an empty patientId", () => {
    const result = appointmentSchema.safeParse({ ...valid, patientId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty doctorId", () => {
    const result = appointmentSchema.safeParse({ ...valid, doctorId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty scheduledAt", () => {
    const result = appointmentSchema.safeParse({ ...valid, scheduledAt: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a scheduledAt in the past", () => {
    const result = appointmentSchema.safeParse({ ...valid, scheduledAt: "2000-01-01T00:00:00" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Date and time cannot be in the past");
    }
  });
});
