import { useEffect, useRef, useState } from "react";
import { gsap } from "../../lib/animations/gsap";
import { isReducedMotion } from "../../lib/utilities/utils";
import { galleryFor, type Product } from "../../data/products";
import { cn } from "../../lib/utilities/utils";

/**
 * Large product gallery. Views render from the local CSS placeholder
 * system today; when `view.src` exists it renders a real <img>
 * (decoding async, lazy below fold) — no component changes needed then.
 */
export default function ProductGallery({ product }: { product: Product }) {
  const views = galleryFor(product);
  const [active, setActive] = useState(views[0].id);
  const stageRef = useRef<HTMLDivElement>(null);
  const view = views.find((v) => v.id === active) ?? views[0];
  const [from, to] = product.finish;

  useEffect(() => {
    if (isReducedMotion() || !stageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-gallery-view]",
        { opacity: 0, scale: 0.985 },
        { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out", overwrite: true }
      );
    }, stageRef);
    return () => ctx.revert();
  }, [active]);

  return (
    <div>
      <div
        ref={stageRef}
        className="relative aspect-[4/5] w-full overflow-hidden bg-stage sm:aspect-square lg:aspect-[4/5]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 55% at 50% 42%, rgba(157,185,221,0.14) 0%, rgba(5,7,13,0) 70%)",
          }}
        />
        {view.src ? (
          <img
            key={view.id}
            data-gallery-view
            src={view.src}
            alt={view.alt}
            decoding="async"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div key={view.id} data-gallery-view className="absolute inset-0 flex items-center justify-center">
            <div
              role="img"
              aria-label={view.alt}
              className={cn(
                "relative rounded-[44px] border border-white/15 shadow-[0_32px_90px_-28px_rgba(0,0,0,0.7)] transition-transform duration-500",
                view.id === "front" && "h-[74%] w-[46%]",
                view.id === "angle" && "h-[78%] w-[50%] -rotate-6 translate-x-4",
                view.id === "detail" && "h-[120%] w-[76%] translate-y-[16%]"
              )}
              style={{ background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)` }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-[4px] rounded-[40px] border border-white/20"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-1/2 top-[6%] -translate-x-1/2 rounded-full border border-black/25 bg-black/30",
                  view.id === "detail" ? "h-[12%] w-[30%]" : "h-[15%] w-[38%]"
                )}
              />
            </div>
          </div>
        )}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/4"
          style={{
            background: "linear-gradient(to top, rgba(5,7,13,0.55) 0%, rgba(5,7,13,0) 100%)",
          }}
        />
      </div>

      {/* Thumbnails */}
      <div role="group" aria-label="Product views" className="mt-4 grid grid-cols-3 gap-3">
        {views.map((v) => {
          const selected = v.id === active;
          return (
            <button
              key={v.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setActive(v.id)}
              className={cn(
                "flex min-h-[64px] flex-col items-center justify-center gap-1.5 border transition-colors duration-200",
                selected
                  ? "border-snow/70 bg-white/5"
                  : "border-white/10 hover:border-white/30"
              )}
            >
              <span
                aria-hidden="true"
                className="h-6 w-4 rounded-[5px] border border-white/25"
                style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
              />
              <span className={cn("font-mono text-[0.65rem] uppercase tracking-[0.2em]", selected ? "text-snow" : "text-mist")}>
                {v.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
