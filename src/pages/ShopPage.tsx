import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import ShopProductCard from "../components/products/ShopProductCard";
import { useDocumentTitle } from "../lib/seo";
import { cn } from "../lib/utilities/utils";
import {
  ratingFor,
  type Product,
} from "../data/products";
import { useProducts } from "../lib/store/useCatalog";

type Sort = "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "selling";

const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "selling", label: "Best selling" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
];

const PRICE_BUCKETS = [
  { id: "all", label: "All prices", test: (_: Product) => true },
  { id: "u500", label: "Under ₹500", test: (p: Product) => p.price < 500 },
  { id: "m", label: "₹500 – ₹999", test: (p: Product) => p.price >= 500 && p.price < 1000 },
  { id: "p", label: "₹1,000 & up", test: (p: Product) => p.price >= 1000 },
];

const PAGE = 9;

function sortProducts(list: Product[], sort: Sort): Product[] {
  const arr = [...list];
  switch (sort) {
    case "price-asc": return arr.sort((a, b) => a.price - b.price);
    case "price-desc": return arr.sort((a, b) => b.price - a.price);
    case "rating": return arr.sort((a, b) => ratingFor(b.id).rating - ratingFor(a.id).rating);
    case "newest": return arr.sort((a, b) => Number(b.index) - Number(a.index));
    case "selling":
      return arr.sort((a, b) => (b.badge === "Bestseller" ? 1 : 0) - (a.badge === "Bestseller" ? 1 : 0) || ratingFor(b.id).reviews - ratingFor(a.id).reviews);
    default: return arr;
  }
}

const KINDS = [
  { id: "cases", label: "Cases" },
  { id: "screen", label: "Screen" },
  { id: "camera", label: "Camera" },
  { id: "charging", label: "Charging" },
  { id: "cables", label: "Cables" },
  { id: "power", label: "Power" },
  { id: "grips", label: "Grips" },
  { id: "stands", label: "Stands" },
  { id: "magsafe", label: "MagSafe" },
  { id: "auto", label: "Car" },
];

const BRANDS = [
  { id: "iphone", label: "iPhone" },
  { id: "samsung", label: "Samsung" },
  { id: "oneplus", label: "OnePlus" },
  { id: "pixel", label: "Pixel" },
  { id: "xiaomi", label: "Xiaomi" },
];

/** Full catalog: sidebar filters (desktop), drawer (mobile), sort, load more. */
export default function ShopPage() {
  useDocumentTitle("Shop all", "Cases, MagSafe, charging and power — the full Cover King catalog.");
  const [params, setParams] = useSearchParams();
  const { products, loading } = useProducts();
  const [kinds, setKinds] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>(() => (params.get("device") ? [params.get("device")!] : []));
  const [price, setPrice] = useState("all");
  const [material, setMaterial] = useState("all");
  const [rated, setRated] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [visible, setVisible] = useState(PAGE);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
    const d = params.get("device");
    if (d) setBrands([d]);
  }, [params]);

  useEffect(() => setVisible(PAGE), [kinds, brands, price, material, rated, inStock, sort, query]);

  const materials = useMemo(() => [...new Set(products.map((p) => p.material))].sort(), [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (kinds.length > 0 && !kinds.includes(p.kind ?? "cases")) return false;
      if (brands.length > 0 && !p.brands.some((b) => brands.includes(b))) return false;
      if (!PRICE_BUCKETS.find((b) => b.id === price)!.test(p)) return false;
      if (material !== "all" && p.material !== material) return false;
      if (rated && ratingFor(p.id).rating < 4.5) return false;
      if (inStock && p.availability !== "in-stock") return false;
      if (q && !`${p.name} ${p.series} ${p.category} ${p.material}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return sortProducts(list, sort);
  }, [products, kinds, brands, price, material, rated, inStock, sort, query]);

  const toggle = (list: string[], v: string, set: (x: string[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const checkRow = (label: string, checked: boolean, onChange: () => void) => (
    <label className="flex min-h-[40px] cursor-pointer items-center gap-3 text-sm text-fgsoft transition-colors hover:text-fg">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[#E0762E]"
      />
      {label}
    </label>
  );

  const panel = (
    <div className="space-y-8">
      <div>
        <p className="ds-annotation text-fgsoft">Category</p>
        <div className="mt-3">
          {KINDS.map((k) => checkRow(k.label, kinds.includes(k.id), () => toggle(kinds, k.id, setKinds)))}
        </div>
      </div>
      <div>
        <p className="ds-annotation text-fgsoft">Device</p>
        <div className="mt-3">
          {BRANDS.map((b) => checkRow(b.label, brands.includes(b.id), () => toggle(brands, b.id, setBrands)))}
        </div>
      </div>
      <div>
        <p className="ds-annotation text-fgsoft">Price</p>
        <div className="mt-3 space-y-1">
          {PRICE_BUCKETS.map((b) => (
            <label key={b.id} className="flex min-h-[40px] cursor-pointer items-center gap-3 text-sm text-fgsoft hover:text-fg">
              <input type="radio" name="price" checked={price === b.id} onChange={() => setPrice(b.id)} className="h-4 w-4 accent-[#E0762E]" />
              {b.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="ds-annotation text-fgsoft">Material</p>
        <div className="mt-3">
          {["all", ...materials].map((m) => (
            <label key={m} className="flex min-h-[40px] cursor-pointer items-center gap-3 text-sm text-fgsoft hover:text-fg">
              <input type="radio" name="material" checked={material === m} onChange={() => setMaterial(m)} className="h-4 w-4 accent-[#E0762E]" />
              {m === "all" ? "All materials" : m}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="ds-annotation text-fgsoft">More</p>
        <div className="mt-3">
          {checkRow("Rated 4.5 & up", rated, () => setRated((v) => !v))}
          {checkRow("In stock only", inStock, () => setInStock((v) => !v))}
        </div>
      </div>
    </div>
  );

  return (
    <section aria-label="Shop all products" className="bg-base text-fg">
      <div className="ds-container ds-section pt-28 md:pt-36">
      <div className="max-w-3xl">
        <p className="ds-annotation text-fgsoft">The catalog</p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4rem)] font-medium tracking-tight">
          Shop all.
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-fgsoft">
          {filtered.length} of {products.length} products{loading ? "…" : "."}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="flex h-12 flex-1 items-center gap-3 rounded-full border border-line px-5 focus-within:border-white/40">
          <span aria-hidden="true" className="text-fgsoft">⌕</span>
          <span className="sr-only">Search products</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setParams(e.target.value ? { q: e.target.value } : {}, { replace: true });
            }}
            placeholder="Search the catalog…"
            className="w-full bg-transparent text-sm text-fg placeholder:text-fgsoft/60 focus:outline-none"
          />
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-line px-5 text-sm text-fg lg:hidden"
          >
            <SlidersHorizontal size={15} aria-hidden="true" /> Filters
          </button>
          <label className="flex h-12 flex-1 items-center gap-2 rounded-full border border-line px-5 text-sm text-fgsoft lg:flex-none">
            <span className="sr-only">Sort products</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="w-full bg-transparent text-fg focus:outline-none [&>option]:bg-abyss"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">{panel}</aside>
        <div>
          {filtered.length === 0 ? (
            <div className="border border-line px-6 py-20 text-center">
              <p className="font-display text-2xl text-fg">Nothing matches those filters.</p>
              <button
                type="button"
                onClick={() => { setKinds([]); setBrands([]); setPrice("all"); setMaterial("all"); setRated(false); setInStock(false); setQuery(""); }}
                className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-snow px-6 text-sm font-medium text-ink"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.slice(0, visible).map((p) => (
                  <ShopProductCard key={p.id} product={p} />
                ))}
              </div>
              {visible < filtered.length && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE)}
                    className="inline-flex min-h-[48px] items-center rounded-full border border-line px-8 text-sm text-fg transition-colors hover:border-fg"
                  >
                    Load more ({filtered.length - visible} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawer && (
        <div role="dialog" aria-modal="true" aria-label="Filters" className="fixed inset-0 z-[80] lg:hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-abyss/70" onClick={() => setDrawer(false)} />
          <aside className="absolute bottom-0 top-16 w-full overflow-y-auto border-t border-line bg-raised px-6 py-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-display text-lg text-fg">Filters</p>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close filters" className="flex h-10 w-10 items-center justify-center rounded-full text-fgsoft hover:text-fg">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            {panel}
            <button
              type="button"
              onClick={() => setDrawer(false)}
              className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-snow font-medium text-ink"
            >
              Show {filtered.length} products
            </button>
          </aside>
        </div>
      )}
      </div>
    </section>
  );
}
