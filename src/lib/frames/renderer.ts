/**
 * Pure frame-mapping + canvas helpers (no React, no GSAP).
 * Testable in isolation — see Stage 4 verification.
 */

/** Scroll progress 0..1 → frame index 0..count-1. Clamped, last frame reachable. */
export function progressToFrameIndex(progress: number, count: number): number {
  if (count <= 0) return 0;
  const p = progress < 0 ? 0 : progress > 1 ? 1 : progress;
  const raw = Math.round(p * (count - 1));
  if (raw < 0) return 0;
  if (raw > count - 1) return count - 1;
  return raw;
}

/** DPR cap: 2 on desktop, 1.5 on mobile (memory + fill-rate). */
export function maxDprForViewport(viewportWidth: number): number {
  const dpr =
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  return Math.min(dpr, viewportWidth < 768 ? 1.5 : 2);
}

/**
 * Size canvas backing store to its CSS box × DPR.
 * Call only on resize/orientation — never per scroll tick.
 */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  maxDpr: number
): { w: number; h: number } {
  const w = Math.max(1, Math.round(canvas.clientWidth));
  const h = Math.max(1, Math.round(canvas.clientHeight));
  const dpr = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    maxDpr
  );
  const bw = Math.max(1, Math.round(w * dpr));
  const bh = Math.max(1, Math.round(h * dpr));
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw;
    canvas.height = bh;
  }
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

/** Cover-fit draw: fills the box, preserves 16:9, never stretches. */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
): void {
  const iw = img.naturalWidth || 16;
  const ih = img.naturalHeight || 9;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}
