/**
 * Atomic config manager for disk-level config writes.
 *
 * Serializes concurrent read/write operations on openclaw.json within
 * a single Node.js process via an async mutex, and uses atomic rename
 * for writes (write to .tmp, rename). Does not provide cross-process locking.
 */

import { readFile, writeFile, rename, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { getOpenClawHome } from "@/lib/paths";

// ── Async mutex ──────────────────────────────────

let lock: Promise<void> = Promise.resolve();

async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const prev = lock;
  let resolve!: () => void;
  lock = new Promise((r) => {
    resolve = r;
  });
  await prev;
  try {
    return await fn();
  } finally {
    resolve();
  }
}

// ── Config path ──────────────────────────────────

function configPath(): string {
  return join(getOpenClawHome(), "openclaw.json");
}

// ── Public API ───────────────────────────────────

/**
 * Read and parse openclaw.json under the lock.
 * Returns an empty object if the file doesn't exist or can't be parsed.
 */
export async function readConfigFile(): Promise<Record<string, unknown>> {
  return withLock(async () => {
    try {
      const raw = await readFile(configPath(), "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch {
      return {};
    }
  });
}

/**
 * Atomically update openclaw.json.
 *
 * Reads the current config, applies `patchFn`, writes to a temp file,
 * then renames over the original (atomic on POSIX). All under the lock.
 */
export async function updateConfigFile(
  patchFn: (config: Record<string, unknown>) => Record<string, unknown>,
): Promise<void> {
  return withLock(async () => {
    const fp = configPath();
    let config: Record<string, unknown> = {};
    try {
      const raw = await readFile(fp, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        config = parsed as Record<string, unknown>;
      }
    } catch {
      // fresh config
    }

    const patched = patchFn(config);
    if (!patched || typeof patched !== "object" || Array.isArray(patched)) {
      throw new Error("patchFn must return a non-null object");
    }
    config = patched;

    const tmpPath = fp + ".tmp";
    await mkdir(dirname(fp), { recursive: true });
    await writeFile(tmpPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
    await rename(tmpPath, fp);
  });
}
