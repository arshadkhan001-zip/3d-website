import Lenis from "lenis";
import { gsap, ScrollTrigger } from "../animations/gsap";

/**
 * Lenis smooth-scroll singleton.
 * - Created once, destroyed on app unmount.
 * - Respects prefers-reduced-motion: returns null (native scroll).
 * - Stage 4: driven by the GSAP ticker while a scrub is mounted
 *   (single loop — never Lenis rAF + gsap.ticker at the same time).
 */

let lenis: Lenis | null = null;
let ownRafId = 0;
let gsapDriving = false;

export function initLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }
  if (lenis) return lenis;
  lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
  });
  function raf(time: number) {
    if (gsapDriving) return; // gsap ticker owns the loop in scrub mode
    lenis?.raf(time);
    ownRafId = requestAnimationFrame(raf);
  }
  ownRafId = requestAnimationFrame(raf);
  return lenis;
}

export function destroyLenis() {
  if (ownRafId) cancelAnimationFrame(ownRafId);
  ownRafId = 0;
  gsapDriving = false;
  lenis?.destroy();
  lenis = null;
}

/**
 * Hand the Lenis loop to GSAP while a ScrollTrigger scrub is mounted:
 * lenis.raf runs on gsap.ticker and ScrollTrigger updates on scroll.
 * Returns a cleanup that restores the standalone loop.
 */
export function connectLenisToScrollTrigger(): () => void {
  const instance = lenis;
  if (!instance) return () => {};
  if (ownRafId) cancelAnimationFrame(ownRafId);
  ownRafId = 0;
  gsapDriving = true;

  const onScroll = () => ScrollTrigger.update();
  instance.on("scroll", onScroll);
  const tick = (time: number) => instance.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  let cleaned = false;
  return () => {
    if (cleaned) return;
    cleaned = true;
    instance.off("scroll", onScroll);
    gsap.ticker.remove(tick);
    gsapDriving = false;
    // Restore standalone loop only if this singleton is still current.
    if (lenis === instance) {
      const raf = (time: number) => {
        if (gsapDriving) return;
        lenis?.raf(time);
        ownRafId = requestAnimationFrame(raf);
      };
      ownRafId = requestAnimationFrame(raf);
    }
  };
}

export function getLenis(): Lenis | null {
  return lenis;
}

/**
 * Smooth-scroll to a section (navbar + hero CTAs).
 * Uses Lenis when active, native smooth scroll otherwise,
 * instant jump when reduced-motion is preferred.
 */
export function scrollToTarget(selector: string): void {
  if (typeof document === "undefined") return;
  const el = document.querySelector(selector);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (lenis && !reduced) {
    lenis.scrollTo(el as HTMLElement, { offset: -56, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }
}
