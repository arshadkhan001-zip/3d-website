import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../data/products";
import { cn } from "../../lib/utilities/utils";

const STATUSES = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"];
const PAY_STATUSES = ["pending", "cod_pending", "cod_collected", "paid", "failed", "refunded"];
const PAGE = 15;

interface OrderRow {
  id: string; order_number: string; customer_name: string; email: string; phone: string;
  total: number; order_status: string; payment_status: string; payment_method: string; created_at: string;
}

/** Order list: search, filters, sort, pagination. */
export function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [pay, setPay] = useState("all");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        let query = supabase().from("orders").select("*", { count: "exact" }).order("created_at", { ascending: false });
        if (status !== "all") query = query.eq("order_status", status);
        if (pay !== "all") query = query.eq("payment_status", pay);
        if (q.trim()) {
          const t = `%${q.trim()}%`;
          query = query.or(`order_number.ilike.${t},customer_name.ilike.${t},phone.ilike.${t},email.ilike.${t}`);
        }
        const { data, error: err, count } = await query.range(page * PAGE, page * PAGE + PAGE - 1);
        if (err) throw err;
        setOrders((data ?? []) as OrderRow[]);
        setTotal(count ?? 0);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, [q, status, pay, page]);

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search number, name, phone, email…" aria-label="Search orders"
          className="h-11 min-w-0 flex-1 rounded-full border border-line bg-transparent px-5 text-sm placeholder:text-fgsoft/70 focus:border-fg focus:outline-none" />
        <div className="flex gap-2">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} aria-label="Filter by order status" className="h-11 rounded-full border border-line bg-transparent px-4 text-sm [&>option]:bg-abyss">
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <select value={pay} onChange={(e) => { setPay(e.target.value); setPage(0); }} aria-label="Filter by payment status" className="h-11 rounded-full border border-line bg-transparent px-4 text-sm [&>option]:bg-abyss">
            <option value="all">All payments</option>
            {["pending", "cod_pending", "cod_collected", "paid", "failed", "refunded"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-ember">{error}</p>}
      {loading ? (
        <p className="mt-8 text-fgsoft">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-8 border border-line px-6 py-16 text-center text-fgsoft">No orders yet.</p>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-[var(--t-line)] border-y border-line">
            {orders.map((o) => (
              <li key={o.id}>
                <Link to={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-white/[0.02]">
                  <div className="min-w-0">
                    <p className="font-mono text-sm">{o.order_number}</p>
                    <p className="truncate text-xs text-fgsoft">{o.customer_name} · {o.phone} · {new Date(o.created_at).toLocaleDateString("en-IN")}</p>
                    <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.14em]">
                      <span className="text-ember">{o.order_status.replace(/_/g, " ")}</span>
                      <span className="text-fgsoft"> · {o.payment_status.replace(/_/g, " ")}</span>
                    </p>
                  </div>
                  <p className="shrink-0 tabular-nums">{formatPrice(o.total)}</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between text-sm text-fgsoft">
            <span>{total} orders</span>
            <div className="flex gap-2">
              <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-full border border-line px-4 py-2 disabled:opacity-40">← Prev</button>
              <button type="button" disabled={(page + 1) * PAGE >= total} onClick={() => setPage((p) => p + 1)} className="rounded-full border border-line px-4 py-2 disabled:opacity-40">Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** Order detail + status updates (each change logs an event + notifies). */
export function AdminOrderDetail() {
  const { id = "" } = useParams();
  const [order, setOrder] = useState<(OrderRow & { address_line_1: string; address_line_2: string; city: string; state: string; postal_code: string; coupon_code: string | null; subtotal: number; shipping_fee: number; discount: number; admin_notes: string }) | null>(null);
  const [items, setItems] = useState<{ product_name: string; variant_name: string; sku: string | null; quantity: number; unit_price: number; total_price: number }[]>([]);
  const [events, setEvents] = useState<{ event_type: string; old_status: string | null; new_status: string | null; note: string; created_at: string }[]>([]);
  const [status, setStatus] = useState("");
  const [payStatus, setPayStatus] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [payBusy, setPayBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = async () => {
    const db = supabase();
    const { data: o } = await db.from("orders").select("*").eq("id", id).single();
    if (!o) return;
    setOrder(o);
    setStatus(o.order_status);
    setPayStatus(o.payment_status);
    const [{ data: it }, { data: ev }] = await Promise.all([
      db.from("order_items").select("*").eq("order_id", id),
      db.from("order_events").select("*").eq("order_id", id).order("created_at"),
    ]);
    setItems(it ?? []);
    setEvents(ev ?? []);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async () => {    if (!order || status === order.order_status) return;
    setBusy(true);
    setMsg(null);
    try {
      const { data: { session } } = await supabase().auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/order-notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ order_id: id, new_status: status, note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Status update failed.");
      setMsg({ kind: "ok", text: `Status → ${status.replace(/_/g, " ")}. Customer notified.` });
      setNote("");
      await load();
    } catch (e) {
      setMsg({ kind: "error", text: e instanceof Error ? e.message : "Status update failed." });
    } finally {
      setBusy(false);
    }
  };

  const updatePayment = async () => {
    if (!order || payStatus === order.payment_status) return;
    setPayBusy(true);
    setMsg(null);
    try {
      const db = supabase();
      const { error } = await db.from("orders").update({ payment_status: payStatus }).eq("id", id);
      if (error) throw error;
      await db.from("payments").update({ status: payStatus }).eq("order_id", id);
      await db.from("order_events").insert({
        order_id: id, event_type: "payment_status_change",
        old_status: order.payment_status, new_status: payStatus, note: "Updated by admin",
      });
      setMsg({ kind: "ok", text: `Payment → ${payStatus.replace(/_/g, " ")}.` });
      await load();
    } catch (e) {
      setMsg({ kind: "error", text: e instanceof Error ? e.message : "Payment update failed." });
    } finally {
      setPayBusy(false);
    }
  };

  if (!order) return <p className="text-fgsoft">Loading order…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <Link to="/admin/orders" className="text-sm text-fgsoft underline underline-offset-4">← All orders</Link>
        <h2 className="mt-3 font-mono text-2xl tracking-[0.06em]">{order.order_number}</h2>
        <p className="mt-1 text-sm text-fgsoft">{new Date(order.created_at).toLocaleString("en-IN")} · {order.payment_method.toUpperCase()} · {order.payment_status.replace(/_/g, " ")}</p>

        <div className="mt-6 border border-line bg-raised p-5">
          <h3 className="font-display text-lg">Customer</h3>
          <p className="mt-2 text-sm">{order.customer_name}<br />{order.email}<br />{order.phone}</p>
          <p className="mt-2 text-sm text-fgsoft">
            {order.address_line_1}{order.address_line_2 ? `, ${order.address_line_2}` : ""}, {order.city}, {order.state} {order.postal_code}
          </p>
        </div>

        <div className="mt-4 border border-line bg-raised p-5">
          <h3 className="font-display text-lg">Items</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((it, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span className="text-fgsoft">{it.product_name}{it.variant_name ? ` · ${it.variant_name}` : ""} × {it.quantity}</span>
                <span className="tabular-nums">{formatPrice(it.total_price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between text-fgsoft"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-ember"><dt>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</dt><dd className="tabular-nums">−{formatPrice(order.discount)}</dd></div>}
            <div className="flex justify-between text-fgsoft"><dt>Shipping</dt><dd className="tabular-nums">{order.shipping_fee === 0 ? "Free" : formatPrice(order.shipping_fee)}</dd></div>
            <div className="flex justify-between font-medium"><dt>Total</dt><dd className="tabular-nums">{formatPrice(order.total)}</dd></div>
          </dl>
        </div>

        <div className="mt-4 border border-line bg-raised p-5">
          <h3 className="font-display text-lg">History</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {events.map((e, i) => (
              <li key={i} className="flex justify-between gap-3 text-fgsoft">
                <span>{e.event_type.replace(/_/g, " ")}{e.old_status ? `: ${e.old_status} → ${e.new_status}` : ""}{e.note ? ` — ${e.note}` : ""}</span>
                <span className="shrink-0 font-mono text-[0.65rem]">{new Date(e.created_at).toLocaleString("en-IN")}</span>
              </li>
            ))}
            {events.length === 0 && <li className="text-fgsoft">No events yet.</li>}
          </ul>
        </div>
      </div>

      <div className="h-fit border border-line bg-raised p-5 lg:sticky lg:top-24">
        <h3 className="font-display text-lg">Update status</h3>
        <label htmlFor="admin-status" className="sr-only">Order status</label>
        <select id="admin-status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-3 h-12 w-full rounded-[12px] border border-line bg-transparent px-4 text-sm [&>option]:bg-abyss">
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <label htmlFor="admin-note" className="sr-only">Note (optional)</label>
        <input id="admin-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="mt-2 h-12 w-full rounded-[12px] border border-line bg-transparent px-4 text-sm placeholder:text-fgsoft/70 focus:border-fg focus:outline-none" />
        <button type="button" onClick={() => void updateStatus()} disabled={busy || status === order.order_status}
          className={cn("mt-3 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-snow font-medium text-ink disabled:opacity-50")}>
          {busy ? "Updating…" : "Update + notify customer"}
        </button>
        {msg && <p role={msg.kind === "error" ? "alert" : "status"} className={cn("mt-3 text-sm", msg.kind === "error" ? "text-ember" : "text-fgsoft")}>{msg.text}</p>}
        <p className="mt-3 text-xs text-fgsoft">Cancelling before shipment restores variant stock automatically.</p>

        <h3 className="mt-6 border-t border-line pt-5 font-display text-lg">Payment status</h3>
        <p className="mt-1 text-xs text-fgsoft">COD stays pending until cash is collected — never mark paid upfront.</p>
        <label htmlFor="admin-pay-status" className="sr-only">Payment status</label>
        <select id="admin-pay-status" value={payStatus} onChange={(e) => setPayStatus(e.target.value)} className="mt-3 h-12 w-full rounded-[12px] border border-line bg-transparent px-4 text-sm [&>option]:bg-abyss">
          {PAY_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <button type="button" onClick={() => void updatePayment()} disabled={payBusy || !order || payStatus === order.payment_status}
          className="mt-3 inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-line font-medium disabled:opacity-50">
          {payBusy ? "Saving…" : "Save payment status"}
        </button>
      </div>
    </div>
  );
}
