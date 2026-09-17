import Button from "../ui/Button";
import { FEATURE_STATEMENTS, FINAL_CTA } from "./heroCopy";
import { cn } from "../../lib/utilities/utils";
import { scrollToTarget } from "../../lib/scroll/lenis";

const alignWrap: Record<string, string> = {
  left: "justify-start text-left",
  center: "justify-center text-center",
  right: "justify-end text-right",
};

/**
 * STAGE 4.5 — Giant scrub-driven feature statements.
 * Each statement is an overlay positioned over the full-screen scene;
 * the scrub timeline crossfades them (opacity/translate/scale only).
 * Invisible until driven (opacity-0 default = safe for reduced-motion).
 */
export default function HeroFeatureStory() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5]">
      {FEATURE_STATEMENTS.map((s) => (
        <div
          key={s.id}
          data-feature={s.id}
          className={cn(
            "absolute inset-0 flex items-center px-6 opacity-0 md:px-[7vw]",
            alignWrap[s.align]
          )}
        >
          <div className="max-w-[92vw]">
            <p className="ds-annotation text-mist">{s.kicker}</p>
            <p className="mt-4 font-display font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-snow text-[clamp(3rem,13.5vw,5.5rem)] md:text-[clamp(4rem,11vw,10.5rem)]">
              {s.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>
      ))}

      {/* Final CTA — arrives at the end of the film, holds to release */}
      <div
        data-hero-final-cta="true"
        className="absolute inset-x-0 bottom-16 z-[6] flex justify-center opacity-0"
      >
        <Button
          size="lg"
          className="pointer-events-auto"
          onClick={() => scrollToTarget("#shop")}
        >
          {FINAL_CTA.label}
          <span aria-hidden="true">→</span>
        </Button>
      </div>
    </div>
  );
}

/**
 * Reduced-motion fallback: the same information as a readable static stack.
 * Rendered below the static hero when scrubbing is disabled.
 */
export function HeroFeatureStatic() {
  return (
    <div className="relative bg-abyss">
      <div className="ds-container py-16">
        <p className="ds-annotation text-mist">Feature story</p>
        <ul className="mt-6">
          {FEATURE_STATEMENTS.map((s) => (
            <li
              key={s.id}
              className="border-t border-white/10 py-8 last:border-b"
            >
              <p className="ds-annotation text-mist">{s.kicker}</p>
              <p className="mt-3 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-snow">
                {s.lines.join(" ")}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Button size="lg">
            {FINAL_CTA.label}
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
