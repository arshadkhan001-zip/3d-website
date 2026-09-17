import type { RefObject } from "react";
import { FIRST_FRAME_INDEX, FRAME_CONFIG, frameUrl } from "../../lib/frames/config";
import { HERO_COPY } from "./heroCopy";
import HeroCanvas from "./HeroCanvas";

/**
 * STAGE 4 REVISION — Full-bleed cinematic stage. No card, no border,
 * no rounding, no caption. The 16:9 source is cover-fit to the viewport
 * (edge-to-edge; minor cropping acceptable, never distorted).
 * Poster <img> paints frame 001 instantly; canvas draws over it opaquely.
 */
export default function HeroStage({
  canvasRef,
}: {
  canvasRef: RefObject<HTMLCanvasElement>;
}) {
  return (
    <div
      data-hero-stage="true"
      data-frame-index={FIRST_FRAME_INDEX}
      data-frame-count={FRAME_CONFIG.count}
      className="absolute inset-0"
    >
      <div data-canvas-mount="true" className="absolute inset-0">
        <img
          src={frameUrl(FIRST_FRAME_INDEX)}
          alt={HERO_COPY.frameAlt}
          width={FRAME_CONFIG.width}
          height={FRAME_CONFIG.height}
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <HeroCanvas canvasRef={canvasRef} />
      </div>
    </div>
  );
}
