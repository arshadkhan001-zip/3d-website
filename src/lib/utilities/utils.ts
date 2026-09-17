/** className merger without extra deps (Stage 1). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Clamp 0..1 — shared by canvas + scroll math in later stages. */
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const isReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isMobileViewport = () =>
  typeof window !== "undefined" && window.innerWidth < 768;
