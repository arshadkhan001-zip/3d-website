import { HERO_COPY } from "./heroCopy";

/** Subtle scroll cue — opacity/transform only, disabled on reduced-motion. */
export default function ScrollHint() {
  return (
    <div className="pointer-events-none flex flex-col items-center gap-3" aria-hidden="true">
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-mist">
        {HERO_COPY.scrollHint}
      </span>
      <span className="hero-scroll-line block h-10 w-px bg-gradient-to-b from-steel/80 to-transparent" />
    </div>
  );
}
