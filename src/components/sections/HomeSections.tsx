import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { gsap, ScrollTrigger } from "../../lib/animations/gsap";
import { isReducedMotion } from "../../lib/utilities/utils";
import { Section } from "../ui/Section";
import { Stars } from "../ui/ProductUI";
import ShopProductCard from "../products/ShopProductCard";
import Newsletter from "./Newsletter";
import { useProducts } from "../../lib/store/useCatalog";
import { COLLECTIONS, DEVICE_GROUPS, REVIEWS } from "../../data/site";

/** Scroll reveal wrapper (transform/opacity only, reduced-motion safe). */
function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!ref.current || isReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y: 32,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 84%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

function Head({ eyebrow, title, copy, link }: { eyebrow: string; title: string; copy?: string; link?: { label: string; to: string } }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="ds-annotation text-mist">{eyebrow}</p>
        <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.04] tracking-tight text-snow">
          {title}
        </h2>
        {copy && <p className="mt-4 max-w-xl leading-relaxed text-mist">{copy}</p>}
      </div>
      {link && (
        <Link
          to={link.to}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 text-sm font-medium text-snow underline underline-offset-8 decoration-white/25 hover:decoration-white"
        >
          {link.label} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

export function CollectionsStrip() {
  const { products } = useProducts();
  return (
    <Section theme="abyss" label="Featured collections" className="border-t border-white/10">
      <Reveal>
        <Head eyebrow="Collections" title="Shop by mood." link={{ label: "All collections", to: "/collections" }} />
      </Reveal>
      <div className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:px-0">
        {COLLECTIONS.map((c) => {
          const n = products.filter(c.match).length;
          return (
            <Link
              key={c.id}
              to={`/collection/${c.id}`}
              className="group w-64 shrink-0 snap-start overflow-hidden border border-white/10 transition-colors hover:border-white/25 md:w-72"
            >
              <span
                aria-hidden="true"
                className="block aspect-[4/3] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                style={{ background: `linear-gradient(140deg, ${c.finish[0]}, ${c.finish[1]})` }}
              />
              <span className="flex items-center justify-between bg-stage px-5 py-4">
                <span>
                  <span className="block font-display text-lg text-snow">{c.name}</span>
                  <span className="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist">
                    {n} products
                  </span>
                </span>
                <span aria-hidden="true" className="text-snow transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}

export function NewArrivals() {
  const { products } = useProducts();
  const items = products.filter((p) => p.badge === "New").slice(0, 8);
  return (
    <Section theme="stage" label="New arrivals">
      <Reveal>
        <Head eyebrow="Just landed" title="New arrivals." link={{ label: "Shop new", to: "/collection/new" }} />
      </Reveal>
      <div className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-2 md:mx-0 md:px-0">
        {items.map((p) => (
          <div key={p.id} className="w-64 shrink-0 snap-start sm:w-72">
            <ShopProductCard product={p} />
          </div>
        ))}
      </div>
    </Section>
  );
}

export function ShopByDevice() {
  return (
    <Section theme="abyss" label="Shop by device" className="border-t border-white/10">
      <Reveal>
        <Head eyebrow="Compatibility" title="Made for your phone." copy="Pick your device — every cover is cut precisely for it." />
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
        {DEVICE_GROUPS.map((d) => (
          <Link
            key={d.brand}
            to={`/shop?device=${d.filter}`}
            className="group border border-white/10 p-6 transition-colors hover:border-white/25"
          >
            <span
              aria-hidden="true"
              className="block h-16 rounded-[12px] border border-white/10 transition-transform duration-500 group-hover:scale-[1.04]"
              style={{ background: `linear-gradient(140deg, ${d.finish[0]}, ${d.finish[1]})` }}
            />
            <span className="mt-4 block font-display text-lg text-snow">{d.label}</span>
            <span className="mt-1 block text-xs leading-relaxed text-mist">{d.models.slice(0, 3).join(" · ")}</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

export function Reviews() {
  const avg = REVIEWS.reduce((n, r) => n + r.rating, 0) / REVIEWS.length;
  return (
    <Section theme="stage" label="Customer reviews">
      <Reveal>
        <div className="max-w-2xl">
          <p className="ds-annotation text-mist">Reviews</p>
          <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-medium tracking-tight text-snow">
            Rated {avg.toFixed(1)} by the people who drop phones.
          </h2>
        </div>
      </Reveal>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REVIEWS.map((r) => (
          <figure key={r.id} className="flex flex-col border border-white/10 bg-abyss/40 p-6">
            <Stars value={r.rating} />
            <figcaption className="mt-3 font-display text-lg text-snow">{r.title}</figcaption>
            <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-mist">“{r.text}”</blockquote>
            <p className="mt-4 flex items-center gap-2 text-xs text-mist">
              <span className="text-snow">{r.name}</span> · {r.product}
              {r.verified && (
                <span className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel">
                  Verified
                </span>
              )}
            </p>
          </figure>
        ))}
      </div>
    </Section>
  );
}

export function UgcGallery() {
  const { products } = useProducts();
  const tiles = products.slice(0, 6);
  return (
    <Section theme="abyss" label="Community" className="border-t border-white/10">
      <Reveal>
        <Head eyebrow="@form.studio" title="Worn everywhere." copy="Tag us to get featured." />
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {tiles.map((p, i) => (
          <div
            key={p.id}
            className="relative aspect-square overflow-hidden border border-white/10"
            style={{ background: `linear-gradient(150deg, ${p.finish[0]}, ${p.finish[1]})` }}
          >
            <span aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 50% 100%, rgba(5,7,13,0.55), transparent 70%)" }} />
            <span className="absolute bottom-2 left-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/80">
              @{["arjun.d", "sneha.r", "kabir.m", "isha.p", "dev.a", "meera.k"][i]}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function NewsletterSection() {
  return (
    <Section theme="stage" label="Newsletter">
      <Newsletter />
    </Section>
  );
}
