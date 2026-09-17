/**
 * Single source of truth for the scroll-driven hero frame sequence.
 *
 * AUDIT (Stage 1, verified read-only):
 * - Location on disk: F:\open web\frames\ezgif-frame-001.jpg … ezgif-frame-239.jpg
 * - Count: 239 files, sequential 1..239, no gaps
 * - Dimensions: 1280x720 (16:9 landscape), JPG
 * - Sizes: ~15KB avg, ~3.7MB total
 * - NOTE: brief asked for 231, but 239 were found. FRAME_COUNT defaults to 239.
 *   To use exactly 231, set FRAME_COUNT = 231 (uses 001..231) — no file renames needed.
 * - Originals are NEVER renamed/modified. Stage 1 copies (not moves) them to public/frames/.
 */

export const FRAME_COUNT = 239;

/** First frame index (0-based). Keep 0. */
export const FIRST_FRAME_INDEX = 0;

/** Pad width: ezgif-frame-001.jpg */
const PAD = 3;

export function frameFileName(index: number): string {
  const n = index + 1; // 0-based -> 1-based
  return `ezgif-frame-${String(n).padStart(PAD, "0")}.jpg`;
}

/** Public URL used by <canvas> loader and <link rel=preload>. Respects Vite base for GitHub Pages. */
export function frameUrl(index: number): string {
  return `${import.meta.env.BASE_URL}frames/${frameFileName(index)}`;
}

/** Frame sequence config consumed by Stage 4 loader/renderer. */
export const FRAME_CONFIG = {
  count: FRAME_COUNT,
  width: 1280,
  height: 720,
  aspect: 16 / 9,
  // Progressive loading strategy (implemented in Stage 4):
  initialPriority: [0, FRAME_COUNT - 1] as number[],
  concurrency: 6,
  maxDprDesktop: 2,
  maxDprMobile: 1.5,
} as const;
