import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../lib/cart/cart";
import { useStoreSettings, shippingForTotal } from "../lib/store/settings";
import { isSupabaseConfigured } from "../lib/supabase";
import { formatPrice } from "../data/products";
import { useDocumentTitle } from "../lib/seo";
import { saveOrder as saveLocalOrder, type Order as LocalOrder } from "../lib/orders";
import { placeOrderRemote } from "../lib/store/orders";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/utilities/utils";

const STATES = ["Andhra Pradesh","Bihar","Delhi","Gujarat","Haryana","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal","Other"];
const METHODS = ["UPI", "Card", "Net banking", "Wallet", "COD"] as const;

/* ── Payment abstraction: COD is live; online providers plug in later ── */
export interface PaymentProvider {
  id: "cod" | "online";
  label: string;
  enabled: boolean;
  note: string;
}
export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  { id: "cod", label: "Cash on Delivery", enabled: true, note: "Pay when your order arrives." },
  { id: "online", label: "Online Payment", enabled: false, note: "Coming soon — UPI, cards & netbanking." },
];

const inputCls =
  "h-12 w-full rounded-[12px] border border-line bg-transparent px-4 text-sm text-fg placeholder:text-fgsoft/70 focus:border-fg focus:outline-none";

/** Real checkout: server-validated COD via Edge Function, or labeled demo mode. */
export default function CheckoutPage() {
  useDocumentTitle("Checkout", "Contact, shipping and cash-on-delivery.");
  const { items, subtotal, discount, total, coupon, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const cloud = isSupabaseConfigured();
  const [form, setForm] = useState({ email: user?.email ?? "", name: "", address: "", city: "", state: "Karnataka", pin: "", phone: "", delivery: "Standard (3–5 days)", payment: "UPI" as string, gift: false });
  const [errors, setErrors] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [provider, setProvider] = useState<"cod" | "online">("cod");
  const settings = useStoreSettings();
  const shipping = shippingForTotal(total, settings);
  const grand = total + shipping;

  const summary = useMemo(() => ({ subtotal, discount, shipping, grand }), [subtotal, discount, shipping, grand]);

  if (items.length === 0) {
    return (
      <section className="bg-base text-fg">
        <div className="ds-container ds-section pt-32 text-center">
          <h1 className="font-display text-4xl">Your bag is empty.</h1>
          <Link to="/shop" className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-snow px-8 font-medium text-ink">Shop covers</Link>
        </div>
      </section>
    );
  }

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.push("Enter a valid email.");
    if (form.name.trim().length < 2) errs.push("Enter your name.");
    if (form.address.trim().length < 6) errs.push("Enter your street address.");
    if (form.city.trim().length < 2) errs.push("Enter your city.");
    if (!/^\d{6}$/.test(form.pin.trim())) errs.push("PIN code must be 6 digits.");
    if (!/^[\d+\s-]{8,15}$/.test(form.phone.trim())) errs.push("Enter a valid phone number.");
    return errs;
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;
    setProcessing(true);

    try {
      if (cloud) {
        // Idempotency key survives double-clicks AND refresh mid-attempt.
        let key = sessionStorage.getItem("ckp-idem");
        if (!key) {
          key = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
          sessionStorage.setItem("ckp-idem", key);
        }
        const { order } = await placeOrderRemote({
          customer: {
            name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
            address1: form.address.trim(), city: form.city.trim(), state: form.state,
            pin: form.pin.trim(),
          },
          lines: items.map((i) => ({
            productDbId: (i as { dbId?: string }).dbId ?? null,
            productSlug: i.slug,
            variantDbId: /^[0-9a-f-]{36}$/.test(i.variantId) ? i.variantId : null,
            qty: i.qty,
          })),
          coupon_code: coupon,
          payment_method: "cod",
          idempotency_key: key,
          notes: form.gift ? "Gift wrap requested" : undefined,
        });
        sessionStorage.removeItem("ckp-idem");
        clear();
        navigate(`/order/${order.order_number}`, {
          state: {
            receipt: {
              order_number: order.order_number,
              total: order.total,
              name: form.name.trim(),
              email: form.email.trim(),
              city: form.city.trim(),
              pin: form.pin.trim(),
              method: form.delivery,
              items: items.map((i) => ({ name: i.name, modelLabel: i.modelLabel, qty: i.qty, price: i.price })),
            },
          },
        });
      } else {
        // Labeled demo mode — local order only, never presented as real.
        const order: LocalOrder = {
          id: `DEMO-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toISOString(),
          email: form.email, name: form.name, address: form.address, city: form.city,
          state: form.state, pin: form.pin, phone: form.phone,
          method: form.delivery, payment: "COD",
          items: items.map((i) => ({ name: i.name, modelLabel: i.modelLabel, variantLabel: i.variantLabel, qty: i.qty, price: i.price })),
          subtotal, discount, shipping, total: grand, status: 1,
        };
        saveLocalOrder(order);
        clear();
        navigate(`/order/${order.id}`, {
          state: {
            receipt: {
              order_number: order.id,
              total: order.total,
              name: order.name,
              email: order.email,
              city: order.city,
              pin: order.pin,
              method: order.method,
              items: order.items.map((i) => ({ name: i.name, modelLabel: i.modelLabel, qty: i.qty, price: i.price })),
            },
          },
        });
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Unable to place order. Please try again."]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section aria-label="Checkout" className="bg-base text-fg">
      <div className="ds-container ds-section pt-28 md:pt-36">
        <p className="ds-annotation text-fgsoft">
          {cloud ? "Checkout — cash on delivery" : "Checkout — demo mode (backend not connected)"}
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium tracking-tight">Almost yours.</h1>
        {!cloud && (
          <p role="note" className="mt-4 max-w-2xl border border-dashed border-line px-4 py-3 text-sm text-fgsoft">
            Demo mode: Supabase isn&apos;t configured, so this order saves to your browser only.
            Add <span className="font-mono">VITE_SUPABASE_URL</span> + <span className="font-mono">VITE_SUPABASE_ANON_KEY</span> to enable real COD orders.
          </p>
        )}

        <form onSubmit={placeOrder} className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-10">
            <fieldset>
              <legend className="font-display text-xl">Contact</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div><label htmlFor="co-email" className="sr-only">Email</label><input id="co-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email" className={inputCls} /></div>
                <div><label htmlFor="co-phone" className="sr-only">Phone</label><input id="co-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone (+91…)" className={inputCls} /></div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-display text-xl">Shipping address</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2"><label htmlFor="co-name" className="sr-only">Full name</label><input id="co-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" className={inputCls} /></div>
                <div className="sm:col-span-2"><label htmlFor="co-addr" className="sr-only">Address</label><input id="co-addr" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Flat / street / landmark" className={inputCls} /></div>
                <div><label htmlFor="co-city" className="sr-only">City</label><input id="co-city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City" className={inputCls} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label htmlFor="co-state" className="sr-only">State</label><select id="co-state" value={form.state} onChange={(e) => set("state", e.target.value)} className={cn(inputCls, "[&>option]:bg-abyss")}><option value="">State</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select></div>
                  <div><label htmlFor="co-pin" className="sr-only">PIN code</label><input id="co-pin" inputMode="numeric" value={form.pin} onChange={(e) => set("pin", e.target.value)} placeholder="PIN" className={inputCls} /></div>
                </div>
                <p className="text-xs text-fgsoft sm:col-span-2">Country: India · GST invoice available on request.</p>
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-display text-xl">Delivery</legend>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {["Standard (3–5 days)", "Express (1–2 days)"].map((d) => (
                  <label key={d} className={cn("flex min-h-[52px] cursor-pointer items-center rounded-[12px] border px-4 text-sm", form.delivery === d ? "border-fg" : "border-line")}>
                    <input type="radio" name="delivery" checked={form.delivery === d} onChange={() => set("delivery", d)} className="sr-only" />
                    {d}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-display text-xl">Payment</legend>
              <div className="mt-4 space-y-3" role="radiogroup" aria-label="Payment provider">
                {PAYMENT_PROVIDERS.map((p) => (
                  <label key={p.id} className={cn("flex min-h-[60px] cursor-pointer items-center gap-4 rounded-[12px] border px-5", !p.enabled && "cursor-not-allowed opacity-60", provider === p.id && p.enabled ? "border-fg" : "border-line")}>
                    <input type="radio" name="provider" checked={provider === p.id} disabled={!p.enabled} onChange={() => setProvider(p.id)} className="sr-only" />
                    <span>
                      <span className="block text-sm font-medium">{p.label}</span>
                      <span className="block text-xs text-fgsoft">{p.note}</span>
                    </span>
                    {!p.enabled && (
                      <span className="ml-auto rounded-full border border-line px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-fgsoft">
                        Coming soon
                      </span>
                    )}
                  </label>
                ))}
              </div>
              {provider === "cod" && (
                <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="COD confirmation channel">
                  <p className="w-full text-xs text-fgsoft">Confirm COD over (mock — connects with the OTP above):</p>
                  {METHODS.map((m) => (
                    <label key={m} className={cn("inline-flex min-h-[44px] cursor-pointer items-center rounded-full border px-5 text-sm", form.payment === m ? "border-fg bg-white/5" : "border-line text-fgsoft")}>
                      <input type="radio" name="payment" checked={form.payment === m} onChange={() => set("payment", m)} className="sr-only" />
                      {m === "COD" ? "Cash on delivery" : m}
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <div className="space-y-3">
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
                <input type="checkbox" checked={form.gift} onChange={(e) => set("gift", e.target.checked)} className="h-4 w-4 accent-[#E0762E]" />
                Add gift wrapping (free)
              </label>
            </div>

            {errors.length > 0 && (
              <div role="alert" className="border border-ember/60 px-5 py-4">
                <ul className="list-disc pl-5 text-sm text-ember">{errors.map((er) => <li key={er}>{er}</li>)}</ul>
              </div>
            )}
          </div>

          <div className="h-fit border border-line bg-raised p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-xl">Order summary</h2>
            <ul className="mt-4 space-y-3">
              {items.map((i) => (
                <li key={i.key} className="flex justify-between gap-3 text-sm">
                  <span className="text-fgsoft">{i.name} × {i.qty}</span>
                  <span className="tabular-nums">{formatPrice(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between text-fgsoft"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(summary.subtotal)}</dd></div>
              {summary.discount > 0 && <div className="flex justify-between text-ember"><dt>Discount{coupon ? ` (${coupon})` : ""}</dt><dd className="tabular-nums">−{formatPrice(summary.discount)}</dd></div>}
              <div className="flex justify-between text-fgsoft"><dt>Shipping</dt><dd className="tabular-nums">{summary.shipping === 0 ? "Free" : formatPrice(summary.shipping)}</dd></div>
              <div className="flex justify-between pt-2 text-base font-medium"><dt>Total</dt><dd className="tabular-nums">{formatPrice(summary.grand)}</dd></div>
            </dl>
            <button
              type="submit"
              disabled={processing}
              className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-snow font-medium text-ink disabled:opacity-60"
            >
              {processing ? "Placing your order…" : `Place COD order · ${formatPrice(summary.grand)}`}
            </button>
            <p className="mt-3 text-center font-mono text-[0.62rem] uppercase tracking-[0.18em] text-fgsoft">
              {cloud ? "Server-validated · idempotent" : "Demo checkout — no money moves"}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
