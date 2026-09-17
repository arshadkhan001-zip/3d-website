import { useEffect, useRef } from "react";
import { gsap } from "../../lib/animations/gsap";
import { isReducedMotion } from "../../lib/utilities/utils";
import ShopProductCard from "./ShopProductCard";
import type { Product } from "../../data/products";

/**
 * Filterable product grid: 1-col mobile, 2-col tablet, 3-col desktop.
 * Entrance stagger via ScrollTrigger (parent may also animate);
 * filter changes replay a quick fade/rise with no reload.
 */
export default function ProductGrid({
  products,
  filterKey,
}: {
  products: Product[];
  filterKey: string;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const firstMount = useRef(true);

  // Entrance on first scroll into view.
  useEffect(() => {
    if (isReducedMotion() || !gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-shop-card]", {
        opacity: 0,
        y: 36,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.07,
        scrollTrigger: { trigger: gridRef.current, start: "top 82%" },
      });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  // Filter transitions (skip on first mount — entrance covers it).
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    if (isReducedMotion() || !gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-shop-card]",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.05, overwrite: true }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [filterKey]);

  if (products.length === 0) {
    return (
      <p className="border-t border-white/10 py-16 text-center text-mist">
        No covers match this filter yet.
      </p>
    );
  }

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-14 lg:grid-cols-3"
      aria-live="polite"
    >
      {products.map((p) => (
        <div key={p.id} data-shop-card>
          <ShopProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
