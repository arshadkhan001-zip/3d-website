import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ORDER_STAGES, demoOrder, getOrder, paymentMethodLabel, paymentStatusLabel } from "../lib/orders";
import { isSupabaseConfigured } from "../lib/supabase";
import { formatPrice } from "../data/products";
import { useDocumentTitle } from "../lib/seo";
import { trackOrderRemote, type TrackedOrder } from "../lib/store/orders";
import { cn } from "../lib/utilities/utils";

/** DB status → 6-stage display index. Cancelled/returned handled separately. */
function stageIndex(status: string): number {
  switch (status) {
    case "confirmed": return 1;
    case "processing": return 1;
    case "packed": return 2;
    case "shipped": return 3;
    case "out_for_delivery": return 4;
    case "delivered": return 5;
    default: return 0;
  }
}

interface Receipt {
  order_number: string;
  total: number;
  name: string;
  email: string;
  city: string;
  pin: string;
  method: string;
  items: { name: string; modelLabel: string; qty: number; price: number }[];
}

/**
 * Order success: renders the fresh receipt passed at checkout, or reloads
 * via phone + order number (guest-safe RPC). Local demo orders as before.
 */
export function OrderPage() {
  const { id = "" } = useParams();
  const location = useLocation() as { state?: { receipt?: Receipt } };
  const cloud = isSupabaseConfigured();
  const [receipt] = useState<Receipt | undefined>(location.state?.receipt);
  const [phone, setPhone] = useState("");
  const [tracked, setTracked] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const local = !cloud && id !== "DEMO123" ? getOrder(id) : undefined;
  const demo = id === "DEMO123" ? demoOrder() : undefined;

  useDocumentTitle(receipt?.order_number ?? id, "Order confirmation.");

  useEffect(() => {
    if (!cloud || receipt || demo || local) return;
    // Deep-linked cloud order without receipt: ask for phone below.
  }, [cloud, receipt, demo, local, id]);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const t = await trackOrderRemote(id, phone);
      if (!t.found) setError("No order matches that number + phone.");
      else setTracked(t);
    } catch {
      setError("Tracking is unavailable right now.");
    } finally {
      setBusy(false);
    }
  };

  // ── fresh receipt (just placed) ──
  if (receipt) {
    return (
      <section aria-label={`Order ${receipt.order_number}`} className="bg-base text-fg">
        <div className="ds-container ds-section mx-auto max-w-3xl pt-28 md:pt-36">
          <p className="ds-annotation text-fgsoft">Thank you, {receipt.name.split(" ")[0]}</p>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium tracking-tight">
            Order placed successfully.
          </h1>
          <p className="mt-3 font-mono text-lg tracking-[0.12em] text-ember">{receipt.order_number}</p>
          <p className="mt-3 text-fgsoft">
            Cash on delivery · {formatPrice(receipt.total)} · arriving {receipt.method.toLowerCase()} to {receipt.city} {receipt.pin}.
          </p>
          <dl className="mt-4 grid gap-2 border border-line bg-raised p-4 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3"><dt className="text-fgsoft">Payment Method</dt><dd className="font-medium">Cash on Delivery</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-fgsoft">Payment Status</dt><dd className="font-medium text-ember">COD Pending</dd></div>
          </dl>
          {!cloud && (
            <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-fgsoft">
              Demo order — saved in this browser only
            </p>
          )}
          <div className="mt-8 border border-line bg-raised p-6">
            <h2 className="font-display text-xl">Items</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {receipt.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="text-fgsoft">{it.name} · {it.modelLabel} × {it.qty}</span>
                  <span className="tabular-nums">{formatPrice(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between border-t border-line pt-3 font-medium">
              <span>Total (COD)</span>
              <span className="tabular-nums">{formatPrice(receipt.total)}</span>
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/track" className="inline-flex min-h-[48px] items-center rounded-full bg-snow px-8 font-medium text-ink">Track order</Link>
            <Link to="/shop" className="inline-flex min-h-[48px] items-center rounded-full border border-line px-8">Continue shopping</Link>
          </div>
        </div>
      </section>
    );
  }

  // ── tracked cloud order ──
  if (tracked?.found) {
    const cancelled = ["cancelled", "returned"].includes(tracked.order_status ?? "");
    const idx = stageIndex(tracked.order_status ?? "pending");
    return (
      <section aria-label={`Order ${tracked.order_number}`} className="bg-base text-fg">
        <div className="ds-container ds-section mx-auto max-w-3xl pt-28 md:pt-36">
          <p className="ds-annotation text-fgsoft">Order status</p>
          <h1 className="mt-4 font-mono text-[clamp(1.6rem,4vw,2.6rem)] tracking-[0.08em]">{tracked.order_number}</h1>
          <p className="mt-2 text-fgsoft">{tracked.items?.length ?? 0} items · {formatPrice(tracked.total ?? 0)} · {tracked.city}</p>
          <dl className="mt-4 grid gap-2 border border-line bg-raised p-4 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3"><dt className="text-fgsoft">Payment Method</dt><dd className="font-medium">{paymentMethodLabel(tracked.payment_method ?? "cod")}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-fgsoft">Payment Status</dt><dd className="font-medium text-ember">{paymentStatusLabel(tracked.payment_status ?? "pending")}</dd></div>
          </dl>
          {cancelled ? (
            <p role="status" className="mt-8 border border-ember/60 px-5 py-4 text-ember">
              This order was {tracked.order_status}. Contact support for help.
            </p>
          ) : (
            <ol className="mt-10">
              {ORDER_STAGES.map((stage, i) => (
                <li key={stage} className="relative flex gap-4 pb-8 last:pb-0">
                  <span aria-hidden="true" className="flex flex-col items-center">
                    <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border text-xs", i <= idx ? "border-ember bg-ember text-white" : "border-line text-fgsoft")}>
                      {i <= idx ? "✓" : i + 1}
                    </span>
                    {i < ORDER_STAGES.length - 1 && <span className={cn("mt-1 w-px flex-1", i < idx ? "bg-ember" : "bg-[var(--t-line)]")} />}
                  </span>
                  <span className={cn("pt-1", i <= idx ? "" : "text-fgsoft")}>
                    <span className="block font-medium">{stage}</span>
                    {i === idx && <span className="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ember">Current</span>}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="inline-flex min-h-[48px] items-center rounded-full bg-snow px-8 font-medium text-ink">Continue shopping</Link>
          </div>
        </div>
      </section>
    );
  }

  // ── local/demo orders (unchanged behavior) ──
  const order = demo ?? local;
  if (order) {
    const idx = order.status;
    return (
      <section aria-label={`Order ${order.id}`} className="bg-base text-fg">
        <div className="ds-container ds-section mx-auto max-w-3xl pt-28 md:pt-36">
          <p className="ds-annotation text-fgsoft">Thank you, {order.name.split(" ")[0]}</p>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium tracking-tight">
            Order {order.id} confirmed.
          </h1>
          <p className="mt-3 text-fgsoft">
            A receipt went to {order.email}. Arriving {order.method.toLowerCase()} to {order.city} {order.pin}.
          </p>
          <ol className="mt-10">
            {ORDER_STAGES.map((stage, i) => (
              <li key={stage} className="relative flex gap-4 pb-8 last:pb-0">
                <span aria-hidden="true" className="flex flex-col items-center">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border text-xs", i <= idx ? "border-ember bg-ember text-white" : "border-line text-fgsoft")}>
                    {i <= idx ? "✓" : i + 1}
                  </span>
                  {i < ORDER_STAGES.length - 1 && <span className={cn("mt-1 w-px flex-1", i < idx ? "bg-ember" : "bg-[var(--t-line)]")} />}
                </span>
                <span className={cn("pt-1", i <= idx ? "" : "text-fgsoft")}>
                  <span className="block font-medium">{stage}</span>
                  {i === idx && <span className="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ember">Current</span>}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-10 border border-line bg-raised p-6">
            <h2 className="font-display text-xl">Items</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="text-fgsoft">{it.name} · {it.modelLabel} × {it.qty}</span>
                  <span className="tabular-nums">{formatPrice(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
          <p className="mt-4 flex justify-between border-t border-line pt-3 font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(order.total)}</span>
          </p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-3"><dt className="text-fgsoft">Payment Method</dt><dd className="font-medium">Cash on Delivery</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-fgsoft">Payment Status</dt><dd className="font-medium text-ember">COD Pending</dd></div>
          </dl>
          {order.id.startsWith("DEMO") && (
            <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-fgsoft">
              Demo order — saved in this browser only
            </p>
          )}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="inline-flex min-h-[48px] items-center rounded-full bg-snow px-8 font-medium text-ink">Continue shopping</Link>
            <Link to="/track" className="inline-flex min-h-[48px] items-center rounded-full border border-line px-8">Track order</Link>
          </div>
        </div>
      </section>
    );
  }

  // ── cloud deep link without receipt: verify phone to view ──
  if (cloud) {
    return (
      <section className="bg-base text-fg">
        <div className="ds-container ds-section mx-auto max-w-xl pt-28 md:pt-36">
          <p className="ds-annotation text-fgsoft">Order {id}</p>
          <h1 className="mt-4 font-display text-4xl font-medium tracking-tight">Verify to view.</h1>
          <p className="mt-3 text-fgsoft">Enter the phone number used at checkout.</p>
          <form onSubmit={lookup} className="mt-6 flex gap-2">
            <label htmlFor="vo-phone" className="sr-only">Phone number</label>
            <input id="vo-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="h-12 min-w-0 flex-1 rounded-full border border-line bg-transparent px-5 text-sm focus:border-fg focus:outline-none" />
            <button type="submit" disabled={busy} className="h-12 shrink-0 rounded-full bg-snow px-6 text-sm font-medium text-ink disabled:opacity-60">
              {busy ? "Checking…" : "View"}
            </button>
          </form>
          {error && <p role="alert" className="mt-4 text-sm text-ember">{error}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-base text-fg">
      <div className="ds-container ds-section pt-32 text-center">
        <h1 className="font-display text-4xl">Order not found.</h1>
        <p className="mt-3 text-fgsoft">Check the ID or try the demo order <span className="font-mono">DEMO123</span>.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/track" className="inline-flex min-h-[48px] items-center rounded-full bg-snow px-8 font-medium text-ink">Track another</Link>
          <Link to="/shop" className="inline-flex min-h-[48px] items-center rounded-full border border-line px-8">Shop</Link>
        </div>
      </div>
    </section>
  );
}

/** Tracking lookup: phone + order number (cloud RPC) or local ID (demo). */
export function TrackPage() {
  useDocumentTitle("Track order", "Follow your Cover King order from packed to delivered.");
  const cloud = isSupabaseConfigured();
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [tried, setTried] = useState<string | null>(null);
  const [tracked, setTracked] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const local = !cloud && tried ? (tried === "DEMO123" ? demoOrder() : getOrder(tried)) : undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTracked(null);
    if (cloud) {
      if (!phone.trim()) {
        setError("Enter the phone number used at checkout.");
        return;
      }
      setBusy(true);
      try {
        const t = await trackOrderRemote(id, phone);
        if (!t.found) setError(`No order matches ${id} + that phone.`);
        else setTracked(t);
      } catch {
        setError("Tracking is unavailable right now.");
      } finally {
        setBusy(false);
      }
    } else {
      setTried(id);
    }
  };

  const trackedIdx = tracked?.found ? stageIndex(tracked.order_status ?? "pending") : -1;
  const trackedCancelled = tracked?.found && ["cancelled", "returned"].includes(tracked.order_status ?? "");

  return (
    <section aria-label="Track order" className="bg-base text-fg">
      <div className="ds-container ds-section mx-auto max-w-2xl pt-28 md:pt-36">
        <p className="ds-annotation text-fgsoft">Support</p>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium tracking-tight">Track order.</h1>
        <form onSubmit={submit} className="mt-8 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label htmlFor="track-id" className="sr-only">Order number</label>
            <input id="track-id" value={id} onChange={(e) => setId(e.target.value)} placeholder={cloud ? "CKP-2026-000123" : "e.g. FORM-123456 (try DEMO123)"} className="h-12 w-full rounded-full border border-line bg-transparent px-5 font-mono text-sm uppercase placeholder:normal-case placeholder:text-fgsoft/70 focus:border-fg focus:outline-none" />
          </div>
          {cloud && (
            <div>
              <label htmlFor="track-phone" className="sr-only">Phone number</label>
              <input id="track-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="h-12 w-full rounded-full border border-line bg-transparent px-5 text-sm focus:border-fg focus:outline-none" />
            </div>
          )}
          <button type="submit" disabled={busy} className="h-12 shrink-0 rounded-full bg-snow px-6 text-sm font-medium text-ink disabled:opacity-60">
            {busy ? "Tracking…" : "Track"}
          </button>
        </form>

        {error && <p role="alert" className="mt-4 text-sm text-ember">{error}</p>}
        {tried && !cloud && !local && (
          <p role="alert" className="mt-6 border border-ember/60 px-5 py-4 text-sm text-ember">
            No order found for “{tried}”.
          </p>
        )}

        {tracked?.found && !trackedCancelled && (
          <div className="mt-8 border border-line bg-raised p-6">
            <p className="font-mono text-lg tracking-[0.08em]">{tracked.order_number}</p>
            <p className="mt-1 text-sm text-fgsoft">{tracked.items?.length ?? 0} items · {formatPrice(tracked.total ?? 0)} · {tracked.city}</p>
            <dl className="mt-3 grid gap-2 border border-line bg-abyss/40 p-4 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3"><dt className="text-fgsoft">Payment Method</dt><dd className="font-medium">{paymentMethodLabel(tracked.payment_method ?? "cod")}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-fgsoft">Payment Status</dt><dd className="font-medium text-ember">{paymentStatusLabel(tracked.payment_status ?? "pending")}</dd></div>
            </dl>
            <ol className="mt-6 space-y-3">
              {ORDER_STAGES.map((stage, i) => (
                <li key={stage} className={cn("flex items-center gap-3 text-sm", i <= trackedIdx ? "" : "text-fgsoft")}>
                  <span aria-hidden="true" className={cn("flex h-6 w-6 items-center justify-center rounded-full border text-[0.65rem]", i <= trackedIdx ? "border-ember bg-ember text-white" : "border-line")}>
                    {i <= trackedIdx ? "✓" : i + 1}
                  </span>
                  {stage}
                </li>
              ))}
            </ol>
          </div>
        )}
        {tracked?.found && trackedCancelled && (
          <p role="status" className="mt-8 border border-ember/60 px-5 py-4 text-ember">
            Order {tracked.order_number} was {tracked.order_status}.
          </p>
        )}

        {!cloud && local && (
          <div className="mt-8 border border-line bg-raised p-6">
            <p className="font-display text-xl">{local.id}</p>
            <p className="mt-1 text-sm text-fgsoft">{local.items.length} items · {formatPrice(local.total)} · {local.city}</p>
            <ol className="mt-6 space-y-3">
              {ORDER_STAGES.map((stage, i) => (
                <li key={stage} className={cn("flex items-center gap-3 text-sm", i <= local.status ? "" : "text-fgsoft")}>
                  <span aria-hidden="true" className={cn("flex h-6 w-6 items-center justify-center rounded-full border text-[0.65rem]", i <= local.status ? "border-ember bg-ember text-white" : "border-line")}>
                    {i <= local.status ? "✓" : i + 1}
                  </span>
                  {stage}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
