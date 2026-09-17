import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useCart } from "../../lib/cart/cart";
import { useStoreSettings } from "../../lib/store/settings";
import { formatPrice } from "../../data/products";
import { useProducts } from "../../lib/store/useCatalog";

/** Slide-over cart: items, coupon, free-shipping meter, totals, recommendations. */
export default function CartDrawer() {
  const {
    items, count, subtotal, discount, total, coupon,
    setQty, remove, applyCoupon, removeCoupon, cartOpen, setCartOpen,
  } = useCart();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const { products } = useProducts();
  const settings = useStoreSettings();
  const threshold = settings.free_shipping_threshold;

  if (!cartOpen) return null;

  const remaining = Math.max(0, threshold - total);
  const progress = Math.min(1, total / threshold);
  const recommended = products.filter((p) => !items.some((i) => i.productId === p.id)).slice(4, 6);

  return (
    <div role="dialog" aria-modal="true" aria-label="Shopping bag" className="fixed inset-0 z-[80]">
      <div aria-hidden="true" className="absolute inset-0 bg-abyss/70 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-stage">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-display text-lg text-snow">
            Bag {count > 0 && <span className="text-mist">({count})</span>}
          </h2>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close bag"
            className="flex h-10 w-10 items-center justify-center rounded-full text-mist hover:bg-white/5 hover:text-snow"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-display text-2xl text-snow">Your bag is empty.</p>
            <p className="text-sm text-mist">Beautiful protection is one click away.</p>
            <Link
              to="/shop"
              onClick={() => setCartOpen(false)}
              className="mt-2 inline-flex min-h-[44px] items-center rounded-full bg-snow px-7 font-medium text-ink"
            >
              Shop covers
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-white/10 px-6 py-4">
              {remaining > 0 ? (
                <p className="text-sm text-mist">
                  You&apos;re <span className="text-snow">{formatPrice(remaining)}</span> away from free shipping.
                </p>
              ) : (
                <p className="text-sm text-snow">You&apos;ve unlocked free shipping.</p>
              )}
              <div aria-hidden="true" className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-ember transition-all duration-500" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-white/10 overflow-y-auto px-6">
              {items.map((i) => (
                <li key={i.key} className="flex gap-4 py-4">
                  <span
                    aria-hidden="true"
                    className="h-20 w-14 shrink-0 rounded-[10px] border border-white/15"
                    style={{ background: `linear-gradient(150deg, ${i.finish[0]}, ${i.finish[1]})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-snow">{i.name}</p>
                    <p className="mt-0.5 truncate text-xs text-mist">
                      {i.modelLabel} · {i.variantLabel}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button type="button" aria-label={`Decrease quantity of ${i.name}`} onClick={() => setQty(i.key, i.qty - 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-snow hover:border-white/40">−</button>
                        <span aria-live="polite" className="min-w-5 text-center text-sm tabular-nums text-snow">{i.qty}</span>
                        <button type="button" aria-label={`Increase quantity of ${i.name}`} onClick={() => setQty(i.key, i.qty + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-snow hover:border-white/40">+</button>
                      </div>
                      <p className="text-sm font-medium tabular-nums text-snow">{formatPrice(i.price * i.qty)}</p>
                    </div>
                    <button type="button" onClick={() => remove(i.key)} className="mt-1 text-xs text-mist underline underline-offset-2 hover:text-snow">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 px-6 py-4">
              {coupon ? (
                <p className="flex items-center justify-between text-sm">
                  <span className="font-mono uppercase tracking-[0.15em] text-ember">{coupon} applied</span>
                  <button type="button" onClick={removeCoupon} className="text-mist underline underline-offset-2 hover:text-snow">Remove</button>
                </p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setCodeError(!applyCoupon(code));
                  }}
                  className="flex gap-2"
                >
                  <label htmlFor="coupon" className="sr-only">Discount code</label>
                  <input
                    id="coupon"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setCodeError(false); }}
                    placeholder="Discount code (try FORM10)"
                    className="h-11 min-w-0 flex-1 rounded-full border border-white/15 bg-transparent px-4 text-sm text-snow placeholder:text-mist/60 focus:border-white/40 focus:outline-none"
                  />
                  <button type="submit" className="h-11 shrink-0 rounded-full border border-white/15 px-5 text-sm text-snow hover:border-white/40">
                    Apply
                  </button>
                </form>
              )}
              {codeError && <p role="alert" className="mt-2 text-xs text-ember">That code isn&apos;t valid.</p>}

              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between text-mist"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
                {discount > 0 && (
                  <div className="flex justify-between text-ember"><dt>Discount</dt><dd className="tabular-nums">−{formatPrice(discount)}</dd></div>
                )}
                <div className="flex justify-between font-medium text-snow"><dt>Total</dt><dd className="tabular-nums">{formatPrice(total)}</dd></div>
              </dl>

              <div className="mt-4 grid gap-2">
                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-snow font-medium text-ink"
                >
                  Checkout →
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setCartOpen(false)}
                  className="inline-flex min-h-[44px] items-center justify-center text-sm text-mist hover:text-snow"
                >
                  View full bag
                </Link>
              </div>

              {recommended.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="ds-annotation text-mist">Pairs well with</p>
                  {recommended.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="flex min-h-[44px] items-center justify-between py-1.5 text-sm text-snow"
                    >
                      {p.name}
                      <span className="tabular-nums text-mist">{formatPrice(p.price)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
