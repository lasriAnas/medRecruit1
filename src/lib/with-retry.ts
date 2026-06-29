const TRANSIENT_DNS_PATTERN = /EAI_AGAIN|ENOTFOUND/;

function isTransientDnsError(err: unknown): boolean {
  if (err instanceof Error && TRANSIENT_DNS_PATTERN.test(err.message)) return true;
  const cause = err instanceof Error ? err.cause : undefined;
  return cause instanceof Error && TRANSIENT_DNS_PATTERN.test(cause.message);
}

/**
 * Retries on DNS lookup failures only — this dev sandbox's network path to
 * Supabase occasionally hits a transient EAI_AGAIN that resolves itself within ms.
 */
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 300): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isTransientDnsError(err) || i === attempts - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}
