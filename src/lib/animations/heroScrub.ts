import { gsap, ScrollTrigger } from "./gsap";
import { FRAME_CONFIG, FRAME_COUNT } from "../frames/config";
import {
  createFrameCache,
  loadFramesQueued,
  nearestLoaded,
  type FrameCache,
} from "../frames/loader";
import {
  drawCover,
  fitCanvas,
  maxDprForViewport,
  progressToFrameIndex,
} from "../frames/renderer";
import { connectLenisToScrollTrigger } from "../scroll/lenis";
import { isReducedMotion } from "../utilities/utils";
import {
  FEATURE_STATEMENTS,
  FINAL_CTA,
  STORY_IN,
  STORY_OUT,
} from "../../components/hero/heroCopy";

export interface HeroScrubMount {
  /** Tall sequence section; its scroll span drives progress 0→1. */
  section: HTMLElement;
  /** Canvas the 239 frames are drawn into. */
  canvas: HTMLCanvasElement;
}

/**
 * Mount the 239-frame scroll scrub. Refs + direct canvas draws only —
 * zero React state updates and zero re-renders per scroll tick.
 *
 * - Tall section + CSS-sticky viewport; ScrollTrigger maps the section's
 *   scroll span to progress 0→1 → frames 001→239 (fully reversible)
 * - missing frames fall back to the nearest loaded neighbour (never blank)
 * - reduced-motion: static full-screen poster frame, no scrub
 * - returns a full cleanup (triggers, observers, loaders, Lenis wiring)
 */
export function mountHeroScrub({ section, canvas }: HeroScrubMount): () => void {
  const ctx = canvas.getContext("2d");
  const signal = { disposed: false };
  const cache: FrameCache = createFrameCache(FRAME_COUNT);

  let destroyed = false;
  let target = 0; // requested frame index
  let drawn = -1; // last drawn frame index
  let vw = 0;
  let vh = 0;
  let maxDpr = maxDprForViewport(window.innerWidth);

  const renderIndex = (index: number) => {
    if (!ctx || destroyed || vw <= 0 || vh <= 0) return;
    const img = cache[index] ?? nearestLoaded(cache, index, 12);
    if (!img) return; // keep last successfully rendered frame, never blank
    try {
      drawCover(ctx, img, vw, vh);
      drawn = index;
    } catch (err) {
      if (import.meta.env.DEV) console.error("[hero-scrub] draw failed", err);
    }
  };

  const renderProgress = (progress: number) => {
    target = progressToFrameIndex(progress, FRAME_COUNT);
    if (target !== drawn) renderIndex(target);
  };

  const sizeToBox = () => {
    maxDpr = maxDprForViewport(window.innerWidth);
    const size = fitCanvas(canvas, maxDpr);
    vw = size.w;
    vh = size.h;
  };

  sizeToBox();

  // 1. Frame 001 immediately (matches the poster <img> underneath).
  void loadFramesQueued(cache, [0], signal).then(() => {
    if (!destroyed) renderIndex(0);
  });

  // 2. Remaining 238 frames progressively in the background.
  void loadFramesQueued(
    cache,
    Array.from({ length: FRAME_COUNT - 1 }, (_, k) => k + 1),
    signal,
    {
      concurrency: FRAME_CONFIG.concurrency,
      onEach: (idx) => {
        // If the user is parked on a frame that just arrived, paint it.
        if (!destroyed && idx === target && drawn !== idx) renderIndex(idx);
      },
    }
  ).then(() => {
    if (!destroyed && drawn !== target) renderIndex(target);
  });

  // Resize / orientation only — never resized during scroll ticks.
  const ro = new ResizeObserver(() => {
    if (destroyed) return;
    sizeToBox();
    renderIndex(target >= 0 ? target : 0);
  });
  ro.observe(canvas);

  const teardownLoaders = () => {
    destroyed = true;
    signal.disposed = true;
    ro.disconnect();
    section.style.height = "";
  };

  // Reduced motion: static full-screen hero (poster frame 001), no scrub.
  // Collapse the tall sequence so there is no long static scroll.
  if (isReducedMotion() || !ctx) {
    section.style.height = "auto";
    return teardownLoaders;
  }

  // Single scroll loop: Lenis driven by the GSAP ticker from here on.
  const disconnectLenis = connectLenisToScrollTrigger();

  // Choreography targets (queried, not passed — Hero owns the markup).
  const copyEl = section.querySelector("[data-hero-copy]");
  const hintEl = section.querySelector("[data-hero-hint]");
  const atmosEl = section.querySelector("[data-hero-atmos]");
  const progressEl = section.querySelector("[data-frame-progress]");
  const progressCurrent = section.querySelector(
    "[data-frame-progress-current]"
  );
  const featureEls = new Map(
    FEATURE_STATEMENTS.map((s) => [
      s.id,
      section.querySelector(`[data-feature="${s.id}"]`),
    ])
  );
  const finalCtaEl = section.querySelector("[data-hero-final-cta]");

  const paintProgress = () => {
    if (progressCurrent) {
      progressCurrent.textContent = String(target + 1).padStart(3, "0");
    }
  };

  const gsapCtx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          renderProgress(self.progress);
          paintProgress();
        },
      },
    });

    // Intro copy: fully visible 0–10%, exits by ~25% (CTAs fade with it).
    if (copyEl) tl.to(copyEl, { opacity: 0, x: -40, ease: "none", duration: 0.15 }, 0.1);
    // Scroll hint: out in the first 8%.
    if (hintEl) tl.to(hintEl, { opacity: 0, ease: "none", duration: 0.08 }, 0);
    // Product immersion: barely-there canvas scale across the whole film.
    tl.fromTo(canvas, { scale: 1 }, { scale: 1.05, ease: "none", duration: 1 }, 0);
    // Atmosphere: gentle deepen so the product holds focus.
    if (atmosEl) tl.fromTo(atmosEl, { opacity: 0 }, { opacity: 1, ease: "none", duration: 1 }, 0);
    // Progress readout fades in with the film.
    if (progressEl) tl.to(progressEl, { opacity: 1, ease: "none", duration: 0.08 }, 0.02);
    // Feature story: rise in, hold, drift out; final statement holds to release.
    for (const s of FEATURE_STATEMENTS) {
      const el = featureEls.get(s.id);
      if (!el) continue;
      const [w0, w1] = s.window;
      tl.fromTo(
        el,
        { opacity: 0, y: 70, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, ease: "none", duration: STORY_IN },
        w0
      );
      if (w1 < 1) {
        tl.to(
          el,
          { opacity: 0, y: -70, ease: "none", duration: STORY_OUT },
          Math.max(w0 + STORY_IN, w1 - STORY_OUT)
        );
      }
    }
    // Final CTA arrives at the end and holds through release.
    if (finalCtaEl) {
      tl.fromTo(
        finalCtaEl,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, ease: "none", duration: 0.05 },
        FINAL_CTA.inAt
      );
    }
  });

  renderProgress(0);
  paintProgress();
  const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 300);

  return () => {
    window.clearTimeout(refreshTimer);
    teardownLoaders();
    gsapCtx.revert();
    disconnectLenis();
    ScrollTrigger.refresh();
  };
}
