import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reusable GSAP context hook for Stage 5+ sections.
 * - Creates a scoped gsap.context, reverts on unmount (no leaks).
 * - Disabled when prefers-reduced-motion is set.
 */
export function useGsapContext(
  create: (ctx: gsap.Context) => void | (() => void),
  deps: React.DependencyList = []
) {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const ctx = gsap.context(() => {
      create(ctx);
    });
    // Refresh after fonts/layout settle
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => {
      window.clearTimeout(t);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export { gsap, ScrollTrigger };
