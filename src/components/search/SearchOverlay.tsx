import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { formatPrice } from "../../data/products";
import { PHONE_MODELS } from "../../data/products";
import { POPULAR_SEARCHES } from "../../data/site";
import { useProducts } from "../../lib/store/useCatalog";

const RECENT_KEY = "form-recent-searches";

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

/** Command-style search overlay (desktop) / full-screen (mobile). */
export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { products } = useProducts();

  useEffect(() => {
    if (!open) return;
    setQ("");
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return [];
    return products.filter((p) =>
      `${p.name} ${p.series} ${p.category} ${p.material}`.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [q, products]);

  const deviceHits = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return [];
    return PHONE_MODELS.filter((m) => m.label.toLowerCase().includes(query)).slice(0, 3);
  }, [q]);

  const submit = (term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecent((prev) => {
      const next = [t, ...prev.filter((x) => x !== t)].slice(0, 5);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    onClose();
    navigate(`/shop?q=${encodeURIComponent(t)}`);
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Search" className="fixed inset-0 z-[80]">
      <div aria-hidden="true" className="absolute inset-0 bg-abyss/80 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 top-0 mx-auto mt-0 w-full max-w-2xl p-4 sm:mt-16">
        <div className="overflow-hidden rounded-[20px] border border-white/15 bg-stage shadow-[0_32px_90px_-28px_rgba(0,0,0,0.8)]">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              submit(q);
            }}
            className="flex items-center gap-3 border-b border-white/10 px-5"
          >
            <Search size={18} aria-hidden="true" className="shrink-0 text-mist" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search covers, chargers, power…"
              aria-label="Search products"
              className="h-14 w-full bg-transparent text-snow placeholder:text-mist/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-mist hover:bg-white/5 hover:text-snow"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </form>

          <div className="max-h-[60vh] overflow-y-auto p-5">
            {q.trim().length < 2 ? (
              <div className="space-y-5">
                {recent.length > 0 && (
                  <div>
                    <p className="ds-annotation text-mist">Recent</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {recent.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => submit(r)}
                          className="rounded-full border border-white/15 px-4 py-2 text-sm text-snow hover:border-white/40"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="ds-annotation text-mist">Popular</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => submit(r)}
                        className="rounded-full border border-white/15 px-4 py-2 text-sm text-mist hover:border-white/40 hover:text-snow"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : results.length === 0 && deviceHits.length === 0 ? (
              <p className="py-8 text-center text-mist">
                Nothing found for “{q}”. Try “clear”, “magsafe” or “cable”.
              </p>
            ) : (
              <div className="space-y-5">
                {deviceHits.length > 0 && (
                  <div>
                    <p className="ds-annotation text-mist">Devices</p>
                    <ul className="mt-2">
                      {deviceHits.map((d) => (
                        <li key={d.id}>
                          <Link
                            to={`/shop?device=${d.brand}`}
                            onClick={onClose}
                            className="flex min-h-[44px] items-center justify-between border-b border-white/5 py-2 text-sm text-snow"
                          >
                            {d.label}
                            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist">
                              {d.brandLabel}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <p className="ds-annotation text-mist">Products</p>
                  <ul className="mt-2">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link
                          to={`/product/${p.slug}`}
                          onClick={onClose}
                          className="flex min-h-[52px] items-center justify-between gap-4 border-b border-white/5 py-2"
                        >
                          <span>
                            <span className="block font-display text-snow">{p.name}</span>
                            <span className="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist">
                              {p.series}
                            </span>
                          </span>
                          <span className="shrink-0 font-display tabular-nums text-snow">
                            {formatPrice(p.price)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => submit(q)}
                    className="mt-3 text-sm font-medium text-snow underline underline-offset-4"
                  >
                    See all results for “{q}”
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
