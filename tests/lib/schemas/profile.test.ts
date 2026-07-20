import { describe, it, expect } from "vitest";
import { profileSchema, settingsPasswordSchema } from "@/lib/schemas/profile";

// ── profileSchema ─────────────────────────────────────────────────────────────

const validProfile = { name: "Anas Lasri", email: "anas@clinic.ma" };

describe("profileSchema", () => {
  it("accepts a valid profile", () => {
    expect(profileSchema.safeParse(validProfile).success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = profileSchema.safeParse({ ...validProfile, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });

  it("rejects an empty email", () => {
    const result = profileSchema.safeParse({ ...validProfile, email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email address");
    }
  });

  it("rejects a malformed email", () => {
    const result = profileSchema.safeParse({ ...validProfile, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email address");
    }
  });

  it("rejects an email missing the domain", () => {
    expect(profileSchema.safeParse({ ...validProfile, email: "anas@" }).success).toBe(false);
  });

  it("rejects an email missing the @", () => {
    expect(profileSchema.safeParse({ ...validProfile, email: "anasat clinic.ma" }).success).toBe(false);
  });

  it("accepts various valid email formats", () => {
    const emails = [
      "user@example.com",
      "user+tag@sub.domain.org",
      "first.last@clinic.ma",
    ];
    for (const email of emails) {
      expect(profileSchema.safeParse({ ...validProfile, email }).success).toBe(true);
    }
  });
});

// ── settingsPasswordSchema ────────────────────────────────────────────────────

const validPassword = {
  currentPassword: "oldpass123",
  newPassword: "newpass123",
  confirmPassword: "newpass123",
};

describe("settingsPasswordSchema", () => {
  it("accepts matching passwords of sufficient length", () => {
    expect(settingsPasswordSchema.safeParse(validPassword).success).toBe(true);
  });

  it("accepts exactly 6-character new password", () => {
    expect(
      settingsPasswordSchema.safeParse({ ...validPassword, newPassword: "abc123", confirmPassword: "abc123" }).success,
    ).toBe(true);
  });

  it("rejects an empty currentPassword", () => {
    const result = settingsPasswordSchema.safeParse({ ...validPassword, currentPassword: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Current password is required");
    }
  });

  it("rejects a newPassword shorter than 6 characters", () => {
    const result = settingsPasswordSchema.safeParse({
      ...validPassword,
      newPassword: "abc",
      confirmPassword: "abc",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password must be at least 6 characters");
    }
  });

  it("rejects when newPassword and confirmPassword do not match", () => {
    const result = settingsPasswordSchema.safeParse({
      ...validPassword,
      newPassword: "newpass123",
      confirmPassword: "different456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find((i) => i.path.includes("confirmPassword"));
      expect(confirmError?.message).toBe("Passwords do not match");
    }
  });

  it("rejects an empty confirmPassword", () => {
    const result = settingsPasswordSchema.safeParse({ ...validPassword, confirmPassword: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find((i) => i.path.includes("confirmPassword"));
      expect(confirmError).toBeDefined();
    }
  });

  it("rejects when newPassword matches current but confirmPassword differs", () => {
    const result = settingsPasswordSchema.safeParse({
      currentPassword: "pass123",
      newPassword: "pass123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });

  it("does not require newPassword to differ from currentPassword", () => {
    // schema does not enforce this; it is a UX concern only
    expect(
      settingsPasswordSchema.safeParse({
        currentPassword: "samepass",
        newPassword: "samepass",
        confirmPassword: "samepass",
      }).success,
    ).toBe(true);
  });
});
