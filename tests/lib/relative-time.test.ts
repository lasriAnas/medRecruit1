import { describe, it, expect, vi, afterEach } from "vitest";
import { relativeTime } from "@/lib/relative-time";

const NOW = new Date("2026-01-01T12:00:00Z").getTime();

afterEach(() => vi.useRealTimers());

function freeze(ms: number) {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  return new Date(NOW - ms);
}

describe("relativeTime", () => {
  it("returns 'now' for a message sent less than 1 minute ago", () => {
    expect(relativeTime(freeze(30_000))).toBe("now");
  });

  it("returns 'now' for a message sent 0 seconds ago", () => {
    expect(relativeTime(freeze(0))).toBe("now");
  });

  it("returns minutes for 1–59 minutes ago", () => {
    expect(relativeTime(freeze(60_000))).toBe("1m");
    expect(relativeTime(freeze(5 * 60_000))).toBe("5m");
    expect(relativeTime(freeze(59 * 60_000))).toBe("59m");
  });

  it("returns hours at exactly 60 minutes", () => {
    expect(relativeTime(freeze(60 * 60_000))).toBe("1h");
  });

  it("returns hours for 1–23 hours ago", () => {
    expect(relativeTime(freeze(3 * 3600_000))).toBe("3h");
    expect(relativeTime(freeze(23 * 3600_000))).toBe("23h");
  });

  it("returns days at exactly 24 hours", () => {
    expect(relativeTime(freeze(24 * 3600_000))).toBe("1d");
  });

  it("returns days for multi-day gaps", () => {
    expect(relativeTime(freeze(7 * 24 * 3600_000))).toBe("7d");
  });
});
