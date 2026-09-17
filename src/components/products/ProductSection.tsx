import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../../lib/animations/gsap";
import { Section } from "../ui/Section";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import {
  SHOP_FILTERS,
  materialCount,
  matchesFilter,
  type ShopFilter,
} from "../../data/products";
import { useProducts } from "../../lib/store/useCatalog";

/**
 * Shop / collection section (id="shop"): intro, live count,
 * functional filters, responsive grid. Dark cinematic language throughout.
 */
export default function ProductSection() {
  const scope = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<ShopFilter>("all");
  const { products } = useProducts();

  const counts = useMemo(() => {
    const c = {} as Record<ShopFilter, number>;
    for (const f of SHOP_FILTERS) {
      c[f.id] = products.filter((p) => matchesFilter(p, f.id)).length;
    }
    return c;
  }, [products]);

  const visible = useMemo(
    () => products.filter((p) => matchesFilter(p, filter)),
    [products, filter]
  );

  useLayoutEffect(() => {
    if (!scope.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-shop-head]", {
        opacity: 0,
        y: 32,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-shop-head]", start: "top 80%" },
      });
      gsap.from("[data-shop-filters]", {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-shop-filters]", start: "top 86%" },
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
      label="Shop the collection"
      className="scroll-mt-16 border-t border-white/10"
    >
      <div ref={scope} id="shop" className="scroll-mt-20">
        <div data-shop-head className="max-w-3xl">
          <p className="ds-annotation text-mist">The collection</p>
          <h2 className="mt-5 font-display text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.02] tracking-tight text-snow">
            Protection, considered.
          </h2>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-mist">
            Precision-designed covers for the phones you carry every day —
            one form language, honest materials, nothing decorative.
          </p>
          <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-mist">
            {String(products.length).padStart(2, "0")} forms /{" "}
            {String(materialCount()).padStart(2, "0")} materials
          </p>
        </div>

        <div data-shop-filters className="mt-10">
          <ProductFilters active={filter} onChange={setFilter} counts={counts} />
        </div>

        <div className="mt-12">
          <ProductGrid products={visible} filterKey={filter} />
        </div>
      </div>
    </Section>
  );
}
