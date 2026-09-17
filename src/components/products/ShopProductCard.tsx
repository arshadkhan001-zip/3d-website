import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { formatPrice, modelsFor, ratingFor, type Product } from "../../data/products";
import { useCart } from "../../lib/cart/cart";
import { checkStock } from "../../lib/store/catalog";
import { Stars } from "../ui/ProductUI";

/**
 * Shop card — large visual, minimal info beneath, hover quick-add.
 * Stretched-link keeps the whole card clickable; the quick-add button
 * sits above it (valid, keyboard reachable). Default configuration
 * (first variant + first fit) comes from product data.
 */
export default function ShopProductCard({ product }: { product: Product }) {
  const [from, to] = product.finish;
  const { add, notify, setCartOpen } = useCart();
  const rating = ratingFor(product.id);
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  const quickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    const variant = product.variants[0];
    const stock = await checkStock(product.id, variant.id, 1);
    if (!stock.ok) {
      notify("Sorry — this cover just ran out.", "error");
      return;
    }
    const models = modelsFor(product.id);
    const model = models[0];
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      series: product.series,
      modelId: model?.id ?? "universal",
      modelLabel: model?.label ?? "Universal fit",
      variantId: variant.id,
      variantLabel: variant.label,
      hex: variant.hex,
      price: product.price,
      qty: 1,
      finish: product.finish,
    });
    setCartOpen(true);
  };

  return (
    <article className="group relative">
      {/* Visual stage */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stage">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(75% 60% at 50% 38%, rgba(157,185,221,0.12) 0%, rgba(5,7,13,0) 70%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            aria-hidden="true"
            className="relative h-[68%] w-[44%] rounded-[30px] border border-white/15 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.65)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
            style={{ background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)` }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-[3px] rounded-[27px] border border-white/20"
            />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[7%] h-[15%] w-[38%] -translate-x-1/2 rounded-full border border-black/25 bg-black/30"
            />
          </div>
        </div>
        {/* Circular view indicator */}
        <span
          aria-hidden="true"
          className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full border border-white/25 bg-abyss/60 text-snow opacity-0 backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100"
        >
          →
        </span>
        {(product.badge || discount > 0) && (
          <span className="absolute left-4 top-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-ember">
            {discount > 0 ? `−${discount}%` : product.badge}
          </span>
        )}
        {/* Quick add — visible on touch, hover-revealed on desktop */}
        <button
          type="button"
          onClick={quickAdd}
          aria-label={`Quick add ${product.name} to bag`}
          className="absolute bottom-4 left-4 z-10 flex h-11 items-center gap-2 rounded-full border border-white/25 bg-abyss/70 px-4 text-sm text-snow backdrop-blur-md transition-all duration-300 hover:border-white/50 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          <Plus size={15} aria-hidden="true" /> Quick add
        </button>
        <Link
          to={`/product/${product.slug}`}
          aria-label={`View ${product.name} — ${product.series}, ${formatPrice(product.price)}`}
          className="absolute inset-0"
        />
      </div>

      {/* Info */}
      <div className="pt-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-mist">
          {product.material} — {product.series}
        </p>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl font-medium tracking-tight text-snow">
            <Link to={`/product/${product.slug}`} className="transition-colors hover:text-white">
              {product.name}
            </Link>
          </h3>
          <p className="flex shrink-0 items-baseline gap-2">
            {product.compareAt && (
              <s className="text-sm tabular-nums text-mist">{formatPrice(product.compareAt)}</s>
            )}
            <span className="font-display text-base font-medium tabular-nums text-snow">
              {formatPrice(product.price)}
            </span>
          </p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Stars value={rating.rating} />
          <span className="text-xs tabular-nums text-mist">({rating.reviews})</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5" aria-label="Available colors">
          {product.variants.map((v) => (
            <span
              key={v.id}
              title={v.label}
              aria-hidden="true"
              className="h-3.5 w-3.5 rounded-full border border-white/25"
              style={{ backgroundColor: v.hex }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
