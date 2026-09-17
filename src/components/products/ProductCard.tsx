import { Link } from "react-router-dom";
import { AVAILABILITY_LABEL, formatPrice, type Product } from "../../data/products";
import { cn } from "../../lib/utilities/utils";

/**
 * Stylized CSS cover visual — an abstract product representation,
 * never presented as a photograph. Finish comes from product data.
 */
function CoverVisual({ product }: { product: Product }) {
  const [from, to] = product.finish;
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden bg-stage">
      {/* Studio backdrop: quiet radial wash matching the hero */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(75% 60% at 50% 38%, rgba(157,185,221,0.12) 0%, rgba(5,7,13,0) 70%)",
        }}
      />
      {/* Cover silhouette */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          aria-hidden="true"
          className="relative h-[72%] w-[46%] rounded-[28px] border border-white/15 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.65)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:scale-[1.03]"
          style={{ background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)` }}
        >
          {/* Edge highlight */}
          <span
            aria-hidden="true"
            className="absolute inset-[3px] rounded-[25px] border border-white/20"
          />
          {/* Camera surround */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[7%] h-[16%] w-[38%] -translate-x-1/2 rounded-full border border-black/25 bg-black/30"
          >
            <span
              aria-hidden="true"
              className="absolute left-[16%] top-1/2 h-[52%] aspect-square -translate-y-1/2 rounded-full bg-black/50"
            />
            <span
              aria-hidden="true"
              className="absolute right-[16%] top-1/2 h-[52%] aspect-square -translate-y-1/2 rounded-full bg-black/50"
            />
          </span>
          {/* Series micro-label */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-[9%] text-center font-mono text-[0.55rem] uppercase tracking-[0.3em] text-black/40"
          >
            Form
          </span>
        </div>
      </div>
      {/* Floor fade */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1/4"
        style={{
          background:
            "linear-gradient(to top, rgba(5,7,13,0.5) 0%, rgba(5,7,13,0) 100%)",
        }}
      />
    </div>
  );
}

/**
 * Editorial product card. No marketplace chrome — visual, number,
 * name, description, price, compatibility, view action.
 */
export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group border-t border-white/10 pt-0">
      <Link
        to={`/product/${product.slug}`}
        aria-label={`View ${product.name} — ${product.series}`}
        className="block overflow-hidden rounded-b-[4px] border border-white/10 border-t-0 transition-colors duration-300 group-hover:border-white/25"
      >
        <CoverVisual product={product} />
      </Link>

      <div className="pt-6">
        <p className="flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-[0.22em] text-mist">
          <span>
            {product.index} — {product.category}
          </span>
          {product.badge && <span className="text-ember">{product.badge}</span>}
        </p>

        <h3 className="mt-3 font-display text-2xl font-medium tracking-tight text-snow">
          <Link
            to={`/product/${product.slug}`}
            className="transition-colors duration-200 hover:text-white"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mist">
          {product.series}
        </p>
        <p className="mt-3 max-w-md leading-relaxed text-mist">
          {product.description}
        </p>

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <p className="font-display text-lg font-medium tabular-nums text-snow">
            {formatPrice(product.price)}
          </p>
          <p className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-mist">
            <span
              aria-hidden="true"
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                product.availability === "in-stock" && "bg-emerald-400/80",
                product.availability === "low-stock" && "bg-amber-400/80",
                product.availability === "preorder" && "bg-steel"
              )}
            />
            {AVAILABILITY_LABEL[product.availability]}
          </p>
        </div>

        <p className="mt-3 text-sm text-mist">
          For {product.compatibility.join(" · ")}
        </p>

        <Link
          to={`/product/${product.slug}`}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-snow"
        >
          View product
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
