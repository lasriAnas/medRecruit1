import { describe, it, expect } from "vitest";
import { canEditAppointmentNotes } from "@/lib/can-edit-appointment-notes";

const DOCTOR_ID = "doctor-abc";
const OTHER_ID  = "doctor-xyz";

describe("canEditAppointmentNotes", () => {
  it("ADMIN can edit any appointment", () => {
    expect(canEditAppointmentNotes("ADMIN", "any-id", OTHER_ID)).toBe(true);
  });

  it("DOCTOR can edit their own appointment", () => {
    expect(canEditAppointmentNotes("DOCTOR", DOCTOR_ID, DOCTOR_ID)).toBe(true);
  });

  it("DOCTOR cannot edit another doctor's appointment", () => {
    expect(canEditAppointmentNotes("DOCTOR", DOCTOR_ID, OTHER_ID)).toBe(false);
  });

  it("RECEPTIONIST cannot edit notes", () => {
    expect(canEditAppointmentNotes("RECEPTIONIST", "any-id", "any-id")).toBe(false);
  });

  it("unknown role cannot edit notes", () => {
    expect(canEditAppointmentNotes("", "any-id", "any-id")).toBe(false);
  });
});
