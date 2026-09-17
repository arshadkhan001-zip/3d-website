import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../lib/animations/gsap";
import { Section } from "../ui/Section";
import { COVER_FEATURES, WHY_HEADLINE } from "../../data/features";

/**
 * "Why our covers" — editorial feature section continuing the hero.
 * Same dark cinematic language: hairline dividers, mono numbering,
 * large display type, generous whitespace. No cards, no color.
 * Scroll reveals (opacity/transform only); static and readable
 * when prefers-reduced-motion is set.
 */
export default function WhyCovers() {
  const scope = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!scope.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      // Headline block reveal.
      gsap.from("[data-why-head]", {
        opacity: 0,
        y: 32,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-why-head]", start: "top 78%" },
      });
      // Feature rows reveal sequentially.
      gsap.utils.toArray<HTMLElement>("[data-why-row]").forEach((row) => {
        gsap.from(row, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 86%" },
        });
      });
      // Dividers draw across.
      gsap.utils.toArray<HTMLElement>("[data-why-divider]").forEach((line) => {
        gsap.from(line, {
          scaleX: 0,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: { trigger: line, start: "top 88%" },
        });
      });
      // Numbers drift in subtly.
      gsap.utils.toArray<HTMLElement>("[data-why-index]").forEach((num) => {
        gsap.from(num, {
          opacity: 0,
          x: -12,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: num, start: "top 86%" },
        });
      });
    }, scope);
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => {
      window.clearTimeout(t);
      ctx.revert();
    };
  }, []);

  return (
    <Section
      theme="abyss"
      label="Why our covers"
      className="border-t border-white/10"
    >
      <div ref={scope} className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div data-why-head className="self-start lg:sticky lg:top-28">
          <p className="ds-annotation text-mist">{WHY_HEADLINE.eyebrow}</p>
          <h2
            id="why-heading"
            className="mt-5 font-display text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.02] tracking-tight text-snow"
          >
            {WHY_HEADLINE.titleA}
            <br />
            {WHY_HEADLINE.titleB}
          </h2>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-mist">
            {WHY_HEADLINE.sub}
          </p>
        </div>

        <ul aria-label="Cover features" className="m-0 list-none p-0">
          {COVER_FEATURES.map((f) => (
            <li key={f.index} data-why-row>
              <span
                aria-hidden="true"
                data-why-divider
                className="block h-px origin-left bg-white/10"
              />
              <div className="flex gap-6 py-9 md:gap-10 md:py-11">
                <span
                  data-why-index
                  className="font-mono text-sm tracking-[0.2em] text-mist"
                >
                  {f.index}
                </span>
                <div>
                  <h3 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-medium uppercase leading-[1.05] tracking-tight text-snow">
                    {f.title}
                  </h3>
                  <p className="mt-3 max-w-md leading-relaxed text-mist">
                    {f.copy}
                  </p>
                </div>
              </div>
            </li>
          ))}
          <li aria-hidden="true">
            <span data-why-divider className="block h-px origin-left bg-white/10" />
          </li>
        </ul>
      </div>
    </Section>
  );
}
