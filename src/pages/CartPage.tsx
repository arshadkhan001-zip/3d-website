import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../lib/cart/cart";
import { useStoreSettings, shippingForTotal } from "../lib/store/settings";
import { formatPrice } from "../data/products";
import { useDocumentTitle } from "../lib/seo";

/** Full bag page: line items, coupon, totals, checkout entry. */
export default function CartPage() {
  useDocumentTitle("Your bag", "Review your covers and accessories before checkout.");
  const { items, subtotal, discount, total, coupon, setQty, remove, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const settings = useStoreSettings();
  const shipping = shippingForTotal(total, settings);

  return (
    <section aria-label="Shopping bag" className="bg-base text-fg">
      <div className="ds-container ds-section pt-28 md:pt-36">
        <p className="ds-annotation text-fgsoft">Your bag</p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4rem)] font-medium tracking-tight">
          Bag.
        </h1>
        {items.length === 0 ? (
          <div className="mt-12 border border-line px-6 py-20 text-center">
            <p className="font-display text-2xl">Your bag is empty.</p>
            <Link to="/shop" className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-snow px-8 font-medium text-ink">
              Shop covers
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
            <ul className="divide-y divide-[var(--t-line)] border-y border-line">
              {items.map((i) => (
                <li key={i.key} className="flex gap-5 py-5">
                  <span aria-hidden="true" className="h-24 w-[4.5rem] shrink-0 rounded-[12px] border border-line" style={{ background: `linear-gradient(150deg, ${i.finish[0]}, ${i.finish[1]})` }} />
                  <div className="min-w-0 flex-1">
                    <Link to={`/product/${i.slug}`} className="font-display text-lg hover:underline">{i.name}</Link>
                    <p className="mt-0.5 text-xs text-fgsoft">{i.modelLabel} · {i.variantLabel}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button type="button" aria-label={`Decrease quantity of ${i.name}`} onClick={() => setQty(i.key, i.qty - 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-line">−</button>
                        <span aria-live="polite" className="min-w-5 text-center tabular-nums">{i.qty}</span>
                        <button type="button" aria-label={`Increase quantity of ${i.name}`} onClick={() => setQty(i.key, i.qty + 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-line">+</button>
                      </div>
                      <p className="font-medium tabular-nums">{formatPrice(i.price * i.qty)}</p>
                    </div>
                    <button type="button" onClick={() => remove(i.key)} className="mt-1 text-xs text-fgsoft underline underline-offset-2 hover:text-fg">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="h-fit border border-line bg-raised p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-xl">Summary</h2>
              {coupon ? (
                <p className="mt-4 flex justify-between text-sm">
                  <span className="font-mono uppercase tracking-[0.15em] text-ember">{coupon}</span>
                  <button type="button" onClick={removeCoupon} className="text-fgsoft underline underline-offset-2">Remove</button>
                </p>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setError(!applyCoupon(code)); }} className="mt-4 flex gap-2">
                  <label htmlFor="cart-coupon" className="sr-only">Discount code</label>
                  <input id="cart-coupon" value={code} onChange={(e) => { setCode(e.target.value); setError(false); }} placeholder="Discount code" className="h-11 min-w-0 flex-1 rounded-full border border-line bg-transparent px-4 text-sm placeholder:text-fgsoft/70 focus:outline-none" />
                  <button type="submit" className="h-11 rounded-full border border-line px-5 text-sm">Apply</button>
                </form>
              )}
              {error && <p role="alert" className="mt-2 text-xs text-ember">That code isn&apos;t valid. Try FORM10.</p>}
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-fgsoft"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
                {discount > 0 && <div className="flex justify-between text-ember"><dt>Discount</dt><dd className="tabular-nums">−{formatPrice(discount)}</dd></div>}
                <div className="flex justify-between text-fgsoft"><dt>Shipping</dt><dd className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
                <div className="flex justify-between border-t border-line pt-3 text-base font-medium"><dt>Total</dt><dd className="tabular-nums">{formatPrice(total + shipping)}</dd></div>
              </dl>
              {total < settings.free_shipping_threshold && (
                <p className="mt-3 text-xs text-fgsoft">{formatPrice(settings.free_shipping_threshold - total)} away from free shipping.</p>
              )}
              <Link to="/checkout" className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-snow font-medium text-ink">
                Checkout →
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
