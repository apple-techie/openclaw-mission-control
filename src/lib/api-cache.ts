const cache = new Map<string, { value: unknown; expiresAt: number }>();

export async function cachedResponse<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key);
  if (entry && now < entry.expiresAt) return entry.value as T;
  const value = await fetcher();
  cache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}

export function invalidateCachePrefix(prefix: string): void {
  for (const k of cache.keys()) {
    if (k.startsWith(prefix)) cache.delete(k);
  }
}
