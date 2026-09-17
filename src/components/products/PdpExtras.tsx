import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ShopProductCard from "./ShopProductCard";
import { Stars } from "../ui/ProductUI";
import { formatPrice, kindFor, ratingFor, type Product } from "../../data/products";
import { useProducts } from "../../lib/store/useCatalog";
import { REVIEWS } from "../../data/site";

const RECENT_KEY = "form-recently-viewed";

/** Record a PDP visit for the "Recently viewed" rail. */
export function recordView(slug: string): void {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(RECENT_KEY, JSON.stringify([slug, ...list.filter((s) => s !== slug)].slice(0, 4)));
  } catch {
    /* ignore */
  }
}

export function recentlyViewed(currentSlug: string, catalog: Product[]): Product[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const slugs: string[] = raw ? JSON.parse(raw) : [];
    return slugs
      .filter((s) => s !== currentSlug)
      .map((s) => catalog.find((p) => p.slug === s))
      .filter((p): p is Product => !!p);
  } catch {
    return [];
  }
}

/** Community reviews with distribution + sorting (demo data). */
export function ProductReviews({ product }: { product: Product }) {
  const [sort, setSort] = useState<"recent" | "high" | "low">("recent");
  const rating = ratingFor(product.id);
  const dist = [74, 18, 5, 2, 1];
  const list = [...REVIEWS].sort((a, b) =>
    sort === "high" ? b.rating - a.rating : sort === "low" ? a.rating - b.rating : 0
  );

  return (
    <div className="mt-20 border-t border-white/10 pt-12 md:mt-28">
      <p className="ds-annotation text-mist">Reviews</p>
      <div className="mt-4 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <p className="font-display text-6xl tabular-nums text-snow">{rating.rating.toFixed(1)}</p>
          <div>
            <Stars value={rating.rating} />
            <p className="mt-1 text-sm text-mist">{rating.reviews} verified reviews</p>
          </div>
        </div>
        <div className="w-full max-w-xs space-y-1.5">
          {dist.map((pct, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-mist">
              <span className="w-6 tabular-nums">{5 - i}★</span>
              <span aria-hidden="true" className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full bg-ember" style={{ width: `${pct}%` }} />
              </span>
              <span className="w-8 text-right tabular-nums">{pct}%</span>
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-mist">
          <span className="sr-only">Sort reviews</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-11 rounded-full border border-white/15 bg-transparent px-4 text-snow focus:outline-none [&>option]:bg-abyss">
            <option value="recent">Most recent</option>
            <option value="high">Highest rated</option>
            <option value="low">Lowest rated</option>
          </select>
        </label>
      </div>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {list.map((r) => (
          <li key={r.id} className="border border-white/10 p-6">
            <Stars value={r.rating} />
            <p className="mt-2 font-display text-lg text-snow">{r.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-mist">“{r.text}”</p>
            <p className="mt-3 flex items-center gap-2 text-xs text-mist">
              <span className="text-snow">{r.name}</span> · {r.date} · {r.product}
              {r.verified && <span className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel">Verified</span>}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Same-category recommendations. */
export function RelatedProducts({ product }: { product: Product }) {
  const { products } = useProducts();
  const related = products.filter((p) => p.id !== product.id && kindFor(p) === kindFor(product)).slice(0, 3);
  if (related.length === 0) return null;
  return (
    <div className="mt-20 md:mt-28">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-medium tracking-tight text-snow">
          Pairs well with.
        </h2>
        <Link to="/shop" className="text-sm text-mist underline underline-offset-4 hover:text-snow">Shop all</Link>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((p) => (
          <ShopProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

/** Recently viewed rail (local history). */
export function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const { products } = useProducts();
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => setItems(recentlyViewed(currentSlug, products)), [currentSlug, products]);
  if (items.length === 0) return null;
  return (
    <div className="mt-20 md:mt-28">
      <h2 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-medium tracking-tight text-snow">
        Recently viewed.
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
        {items.map((p) => (
          <ShopProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

/** Sticky mobile buy bar (sits above the bottom nav). */
export function StickyBuyBar({
  product, modelLabel, variantLabel, price, onAdd,
}: {
  product: Product;
  modelLabel: string;
  variantLabel: string;
  price: number;
  onAdd: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-[57px] z-40 border-t border-white/10 bg-abyss/90 backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm text-snow">{product.name}</p>
          <p className="truncate text-[0.7rem] text-mist">
            {modelLabel} · {variantLabel} · <span className="tabular-nums">{formatPrice(price)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex min-h-[48px] shrink-0 items-center rounded-full bg-snow px-6 text-sm font-medium text-ink"
        >
          Add to bag
        </button>
      </div>
    </div>
  );
}
