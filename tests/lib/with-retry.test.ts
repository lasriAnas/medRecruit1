import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withRetry } from "@/lib/with-retry";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("withRetry", () => {
  it("returns the result immediately on success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on EAI_AGAIN and succeeds on second attempt", async () => {
    const dns = new Error("EAI_AGAIN: getaddrinfo failed");
    const fn = vi.fn().mockRejectedValueOnce(dns).mockResolvedValue("ok");

    const promise = withRetry(fn, 3, 300);
    await vi.advanceTimersByTimeAsync(300);
    const result = await promise;

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries on ENOTFOUND and succeeds on second attempt", async () => {
    const dns = new Error("ENOTFOUND some.host");
    const fn = vi.fn().mockRejectedValueOnce(dns).mockResolvedValue("data");

    const promise = withRetry(fn, 3, 100);
    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;

    expect(result).toBe("data");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries on EAI_AGAIN nested in error cause", async () => {
    const cause = new Error("EAI_AGAIN lookup");
    const err = new Error("Connection failed");
    (err as NodeJS.ErrnoException).cause = cause;
    const fn = vi.fn().mockRejectedValueOnce(err).mockResolvedValue("ok");

    const promise = withRetry(fn, 3, 100);
    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws immediately on non-DNS errors", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("Unique constraint failed"));
    await expect(withRetry(fn)).rejects.toThrow("Unique constraint failed");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("exhausts all attempts and re-throws the last DNS error", async () => {
    const dns = new Error("EAI_AGAIN persistent");
    const fn = vi.fn().mockRejectedValue(dns);

    const promise = withRetry(fn, 3, 100);
    // Attach rejection handler immediately so Node never sees an unhandled rejection,
    // then drive the fake timers to let all retry delays elapse.
    const rejection = expect(promise).rejects.toThrow("EAI_AGAIN persistent");
    await vi.advanceTimersByTimeAsync(200);
    await rejection;
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("respects custom attempt count", async () => {
    const dns = new Error("EAI_AGAIN");
    const fn = vi.fn().mockRejectedValue(dns);

    const promise = withRetry(fn, 1, 100);
    await expect(promise).rejects.toThrow("EAI_AGAIN");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
