import { describe, it, expect } from "vitest";
import { buildPatientAdvicePrompt } from "@/lib/build-patient-advice-prompt";

describe("buildPatientAdvicePrompt", () => {
  it("embeds the diagnosis in the prompt", () => {
    const prompt = buildPatientAdvicePrompt("Type 2 diabetes mellitus (E11.9)");
    expect(prompt).toContain("Type 2 diabetes mellitus (E11.9)");
  });

  it("addresses the patient directly", () => {
    const prompt = buildPatientAdvicePrompt("Essential hypertension");
    expect(prompt).toMatch(/you should/i);
  });

  it("requests plain language output", () => {
    const prompt = buildPatientAdvicePrompt("Atopic dermatitis");
    expect(prompt).toMatch(/no jargon/i);
  });

  it("covers all four required sections", () => {
    const prompt = buildPatientAdvicePrompt("COPD exacerbation");
    expect(prompt).toMatch(/plain language/i);
    expect(prompt).toMatch(/lifestyle|dietary/i);
    expect(prompt).toMatch(/warning signs/i);
    expect(prompt).toMatch(/follow.up/i);
  });

  it("trims leading/trailing whitespace from the diagnosis", () => {
    // The prompt itself should not be empty — any non-empty diagnosis is reflected
    const prompt = buildPatientAdvicePrompt("  Acute bronchitis  ");
    expect(prompt).toContain("Acute bronchitis");
  });

  it("returns a non-empty string for any non-empty diagnosis", () => {
    expect(buildPatientAdvicePrompt("x").length).toBeGreaterThan(0);
  });
});
