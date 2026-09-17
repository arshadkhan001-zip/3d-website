import { useLayoutEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import HeroStage from "./HeroStage";
import ScrollHint from "./ScrollHint";
import HeroFeatureStory, { HeroFeatureStatic } from "./HeroFeatureStory";
import FrameProgress from "./FrameProgress";
import { HERO_COPY } from "./heroCopy";
import { mountHeroScrub } from "../../lib/animations/heroScrub";
import { scrollToTarget } from "../../lib/scroll/lenis";
import { isReducedMotion } from "../../lib/utilities/utils";

/**
 * STAGE 4.5 — Full-screen cinematic sequence + typographic feature story.
 * Tall section provides scroll distance; sticky 100svh viewport holds
 * the full-bleed canvas. Intro copy exits early; giant feature statements
 * crossfade across the film; final CTA holds through release.
 * Reduced-motion: static hero + readable static feature list, no scrub.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reduced] = useState(() => isReducedMotion());

  useLayoutEffect(() => {
    if (!sectionRef.current || !canvasRef.current) return;
    return mountHeroScrub({
      section: sectionRef.current,
      canvas: canvasRef.current,
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Featured phone cover"
      className="hero-sequence relative h-[280vh] bg-abyss md:h-[400vh]"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Full-bleed 239-frame canvas */}
        <HeroStage canvasRef={canvasRef} />

        {/* Readability overlays — localized, product stays visible */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,7,13,0.55) 0%, rgba(5,7,13,0) 22%, rgba(5,7,13,0) 70%, rgba(5,7,13,0.6) 100%)",
          }}
        />
        {/* Desktop: soft shade behind left copy */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
          style={{
            background:
              "linear-gradient(to right, rgba(5,7,13,0.5) 0%, rgba(5,7,13,0.18) 34%, rgba(5,7,13,0) 55%)",
          }}
        />
        {/* Mobile: shade behind lower copy */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] md:hidden"
          style={{
            background:
              "linear-gradient(to top, rgba(5,7,13,0.72) 0%, rgba(5,7,13,0.25) 38%, rgba(5,7,13,0) 62%)",
          }}
        />
        {/* Vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 45%, rgba(5,7,13,0) 60%, rgba(5,7,13,0.4) 100%)",
          }}
        />
        {/* Atmosphere deepen — driven 0→1 by the scrub (Stage 5) */}
        <div
          aria-hidden="true"
          data-hero-atmos="true"
          className="pointer-events-none absolute inset-0 z-[1] opacity-0"
          style={{ background: "rgba(5,7,13,0.28)" }}
        />

        {/* Copy overlay — left/center desktop, lower mobile */}
        <div
          data-hero-copy="true"
          className="absolute inset-x-0 bottom-0 z-10 px-6 pb-28 md:bottom-auto md:left-[7vw] md:right-auto md:top-1/2 md:w-auto md:max-w-xl md:-translate-y-1/2 md:px-0 md:pb-0"
        >
          <p className="ds-annotation text-mist">{HERO_COPY.eyebrow}</p>
          <h1 className="mt-5 text-balance font-display text-[clamp(2.4rem,13vw,3.5rem)] font-medium leading-[1.02] tracking-tight text-snow md:text-[clamp(2.75rem,7vw,5.25rem)]">
            {HERO_COPY.headlineA}
            <br />
            {HERO_COPY.headlineB}
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-[1.05rem] leading-relaxed text-mist">
            {HERO_COPY.sub}
          </p>
          <div className="pointer-events-auto mt-8 flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => scrollToTarget("#shop")}
            >
              {HERO_COPY.primaryCta}
            </Button>
            <Button size="lg" variant="ghost" className="w-full sm:w-auto">
              {HERO_COPY.secondaryCta}
            </Button>
          </div>
        </div>

        {/* Feature story + sequence progress (scrub-driven) */}
        <HeroFeatureStory />
        <FrameProgress />

        {/* Scroll cue — bottom center */}
        <div
          data-hero-hint="true"
          className="absolute inset-x-0 bottom-7 z-10 flex justify-center"
        >
          <ScrollHint />
        </div>
      </div>

      {/* Reduced-motion: static readable feature list (scrub disabled) */}
      {reduced && <HeroFeatureStatic />}
    </section>
  );
}
