import { Link } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../lib/animations/gsap";
import { Section } from "../ui/Section";
import { PRODUCTS, formatPrice } from "../../data/products";
import { useProducts } from "../../lib/store/useCatalog";

const DETAILS = [
  "Raised camera protection",
  "Shock absorbing frame",
  "Precision buttons",
  "Wireless charging compatible",
];

const SIGNATURE_SLUG = "form-carbon";

/**
 * Full-width featured product — a continuation of the cinematic hero,
 * not a card: large staged visual left, editorial content right.
 */
export default function FeaturedProduct() {
  const scope = useRef<HTMLDivElement>(null);
  const { products } = useProducts();
  const list = products.length > 0 ? products : PRODUCTS;
  const product = list.find((p) => p.slug === SIGNATURE_SLUG) ?? list[0];
  const [from, to] = product.finish;

  useLayoutEffect(() => {
    if (!scope.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-signature-visual]", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-signature-visual]", start: "top 78%" },
      });
      gsap.from("[data-signature-copy]", {
        opacity: 0,
        y: 32,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-signature-copy]", start: "top 78%" },
      });
      gsap.from("[data-signature-detail]", {
        opacity: 0,
        x: -16,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-signature-details]", start: "top 82%" },
      });
    }, scope);
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => {
      window.clearTimeout(t);
      ctx.revert();
    };
  }, []);

  return (
    <Section theme="stage" label="Signature form">
      <div
        ref={scope}
        className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
      >
        {/* Large staged visual */}
        <div data-signature-visual className="relative aspect-[4/5] w-full overflow-hidden bg-abyss sm:aspect-square lg:aspect-[4/5]">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 55% at 50% 42%, rgba(157,185,221,0.14) 0%, rgba(5,7,13,0) 70%)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              role="img"
              aria-label={`${product.name} large studio visual (stylized placeholder)`}
              className="relative h-[74%] w-[46%] rounded-[44px] border border-white/15 shadow-[0_32px_90px_-28px_rgba(0,0,0,0.7)]"
              style={{ background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)` }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-[4px] rounded-[40px] border border-white/20"
              />
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-[6%] h-[17%] w-[40%] -translate-x-1/2 rounded-[20px] border border-black/25 bg-black/30"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-[14%] top-1/2 aspect-square h-[54%] -translate-y-1/2 rounded-full bg-black/50"
                />
                <span
                  aria-hidden="true"
                  className="absolute right-[14%] top-1/2 aspect-square h-[54%] -translate-y-1/2 rounded-full bg-black/50"
                />
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-[8%] text-center font-mono text-[0.6rem] uppercase tracking-[0.35em] text-black/40"
              >
                Signature
              </span>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-1/4"
            style={{
              background:
                "linear-gradient(to top, rgba(5,7,13,0.55) 0%, rgba(5,7,13,0) 100%)",
            }}
          />
        </div>

        {/* Editorial content */}
        <div data-signature-copy>
          <p className="ds-annotation text-mist">01 / Signature form</p>
          <h2 className="mt-5 font-display text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium leading-[1.04] tracking-tight text-snow">
            Built around
            <br />
            the edges.
          </h2>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-mist">
            {product.description} A raised perimeter and an elevated camera
            surround keep the vulnerable points away from every surface.
          </p>
          <ul
            data-signature-details
            className="mt-8 border-t border-white/10"
          >
            {DETAILS.map((d) => (
              <li
                key={d}
                data-signature-detail
                className="flex items-center gap-4 border-b border-white/10 py-4 text-snow"
              >
                <span aria-hidden="true" className="font-mono text-xs text-ember">
                  +
                </span>
                {d}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              to={`/product/${product.slug}`}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-snow px-7 font-medium text-ink transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px"
            >
              Explore Signature Form
              <span aria-hidden="true">→</span>
            </Link>
            <p className="font-display text-lg font-medium tabular-nums text-snow">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
