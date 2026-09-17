import type { RefObject } from "react";

/**
 * The single canvas for the 239-frame scrub.
 * Transparent until the first frame draws — the poster <img> (frame 001)
 * underneath guarantees instant paint with no blank flash.
 * Refs only: no state, no re-renders.
 */
export default function HeroCanvas({
  canvasRef,
}: {
  canvasRef: RefObject<HTMLCanvasElement>;
}) {
  return (
    <canvas
      ref={canvasRef}
      data-canvas="true"
      aria-hidden="true"
      className="absolute inset-0 block h-full w-full"
    />
  );
}
