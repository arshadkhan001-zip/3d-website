import { FRAME_COUNT } from "../../lib/frames/config";

/**
 * Subtle sequence progress readout ("041 / 239").
 * Updated via textContent in the scrub onUpdate — never React state.
 * Invisible until choreography mounts (safe for reduced-motion).
 */
export default function FrameProgress() {
  return (
    <p
      aria-hidden="true"
      className="pointer-events-none absolute bottom-7 right-6 z-10 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-mist opacity-0 md:right-10"
      data-frame-progress="true"
    >
      <span data-frame-progress-current="true">001</span>
      <span className="mx-2 text-mist/50">/</span>
      {FRAME_COUNT}
    </p>
  );
}
