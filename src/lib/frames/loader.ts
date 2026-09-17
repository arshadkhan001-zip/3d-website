/**
 * Minimal progressive frame loader (infrastructure only — Stage 4 wires it to canvas).
 *
 * Guarantees for later stages:
 * - Never creates 239 <img> DOM nodes; loads into memory Image objects.
 * - Priority-first: requested indices jump the queue.
 * - Bounded concurrency to avoid network/memory spikes.
 * - Graceful fallback: nearest loaded neighbour when exact frame missing.
 * - Async decoding via `img.decoding = "async"`.
 */

import { frameUrl } from "./config";

export type FrameCache = Array<HTMLImageElement | null>;

export function createFrameCache(count: number): FrameCache {
  return new Array(count).fill(null);
}

/** Find nearest loaded frame within `radius` when exact index isn't ready. */
export function nearestLoaded(
  cache: FrameCache,
  index: number,
  radius = 8
): HTMLImageElement | null {
  if (cache[index]) return cache[index];
  for (let d = 1; d <= radius; d++) {
    const a = cache[index - d];
    if (a) return a;
    const b = cache[index + d];
    if (b) return b;
  }
  return cache.find(Boolean) ?? null;
}

interface QueueOptions {
  concurrency?: number;
  onFirstReady?: (img: HTMLImageElement) => void;
  /** Fired for every frame that finishes loading (Stage 4 redraw hook). */
  onEach?: (index: number, img: HTMLImageElement) => void;
}

/**
 * Load `indices` in order with bounded concurrency.
 * Resolves when queue drains. Safe to call once in Stage 4.
 */
export function loadFramesQueued(
  cache: FrameCache,
  indices: number[],
  signal: { disposed: boolean },
  opts: QueueOptions = {}
): Promise<void> {
  const concurrency = opts.concurrency ?? 6;
  const queue = [...indices];
  let active = 0;
  let firstNotified = false;

  return new Promise((resolve) => {
    const pump = () => {
      if (signal.disposed) {
        resolve();
        return;
      }
      while (active < concurrency && queue.length > 0) {
        const index = queue.shift()!;
        if (cache[index]) continue;
        active += 1;
        const img = new Image();
        img.decoding = "async";
        if (index === 0) img.fetchPriority = "high";
        img.onload = () => {
          if (!signal.disposed) {
            cache[index] = img;
            try {
              opts.onEach?.(index, img);
            } catch (err) {
              if (import.meta.env.DEV) console.error("[frames] onEach failed", err);
            }
          }
          active -= 1;
          if (!firstNotified && index === 0) {
            firstNotified = true;
            opts.onFirstReady?.(img);
          }
          if (queue.length === 0 && active === 0) resolve();
          else pump();
        };
        img.onerror = () => {
          active -= 1;
          if (queue.length === 0 && active === 0) resolve();
          else pump();
        };
        img.src = frameUrl(index);
      }
      if (queue.length === 0 && active === 0) resolve();
    };
    pump();
  });
}
