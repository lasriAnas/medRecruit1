import { describe, it, expect } from "vitest";
import { passwordSchema } from "@/lib/schemas/password";

describe("passwordSchema", () => {
  it("accepts matching passwords of sufficient length", () => {
    expect(
      passwordSchema.safeParse({ password: "secret123", confirmPassword: "secret123" }).success,
    ).toBe(true);
  });

  it("rejects password shorter than 6 characters", () => {
    const result = passwordSchema.safeParse({ password: "abc", confirmPassword: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects when passwords do not match", () => {
    const result = passwordSchema.safeParse({
      password: "password1",
      confirmPassword: "password2",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmErr = result.error.issues.find((i) => i.path.includes("confirmPassword"));
      expect(confirmErr?.message).toBe("Passwords do not match");
    }
  });

  it("rejects empty confirmPassword", () => {
    const result = passwordSchema.safeParse({ password: "password1", confirmPassword: "" });
    expect(result.success).toBe(false);
  });

  it("accepts exactly 6 character password", () => {
    expect(
      passwordSchema.safeParse({ password: "abc123", confirmPassword: "abc123" }).success,
    ).toBe(true);
  });
});
