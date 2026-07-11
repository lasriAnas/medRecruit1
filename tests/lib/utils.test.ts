import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("merges conflicting Tailwind classes, keeping the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles conditional object syntax", () => {
    expect(cn({ "font-bold": true, "text-sm": false })).toBe("font-bold");
  });

  it("handles array syntax", () => {
    expect(cn(["a", "b"])).toBe("a b");
  });

  it("returns empty string when no arguments", () => {
    expect(cn()).toBe("");
  });
});
