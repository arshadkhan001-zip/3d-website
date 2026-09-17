import { Link } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../lib/animations/gsap";
import { Section } from "../ui/Section";
import ProductCard from "./ProductCard";
import { useProducts } from "../../lib/store/useCatalog";

/**
 * Featured covers — editorial product discovery continuing the story.
 * 3-col grid on desktop (2-col tablet, 1-col mobile) with an offset
 * middle column rhythm on large screens, staggered scroll reveals.
 */
export default function FeaturedCovers() {
  const scope = useRef<HTMLDivElement>(null);
  const { products } = useProducts();

  useLayoutEffect(() => {
    if (!scope.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-featured-head]", {
        opacity: 0,
        y: 32,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-featured-head]", start: "top 80%" },
      });
      gsap.from("[data-product-card]", {
        opacity: 0,
        y: 36,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: "[data-product-grid]", start: "top 80%" },
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
      label="Featured covers"
      className="border-t border-white/10"
    >
      <div ref={scope}>
        <div
          data-featured-head
          className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <p className="ds-annotation text-mist">The collection</p>
            <h2 className="mt-5 font-display text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.02] tracking-tight text-snow">
              Featured covers.
            </h2>
            <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-mist">
              Designed for the phones you carry every day.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 text-sm font-medium text-snow underline underline-offset-8 decoration-white/25 transition-colors duration-200 hover:decoration-white"
          >
            View all covers
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div
          data-product-grid
          className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 md:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-20"
        >
          {products.map((p, i) => (
            <div
              key={p.id}
              data-product-card
              className={i % 3 === 1 ? "lg:mt-16" : ""}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
