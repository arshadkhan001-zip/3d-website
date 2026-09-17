import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../data/products";

interface Customer {
  id: string; full_name: string | null; email: string | null; phone: string | null; created_at: string;
  orders: { id: string; order_number: string; total: number; created_at: string }[];
}

/** Customer list with spend + order counts. */
export function AdminCustomers() {
  const [rows, setRows] = useState<(Customer & { totalSpent: number })[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: profiles }, { data: orders }] = await Promise.all([
        supabase().from("profiles").select("id,full_name,email,phone,created_at").order("created_at", { ascending: false }).limit(200),
        supabase().from("orders").select("id,order_number,total,created_at,user_id,email,customer_name,phone"),
      ]);
      const byUser = new Map<string, { totalSpent: number; orders: Customer["orders"] }>();
      for (const o of (orders ?? []) as { id: string; order_number: string; total: number; created_at: string; user_id: string | null }[]) {
        if (!o.user_id) continue;
        const e = byUser.get(o.user_id) ?? { totalSpent: 0, orders: [] };
        e.totalSpent += o.total;
        e.orders.push({ id: o.id, order_number: o.order_number, total: o.total, created_at: o.created_at });
        byUser.set(o.user_id, e);
      }
      setRows(((profiles ?? []) as Omit<Customer, "orders">[]).map((p) => ({
        ...p,
        orders: (byUser.get(p.id)?.orders ?? []).sort((a, b) => b.created_at.localeCompare(a.created_at)),
        totalSpent: byUser.get(p.id)?.totalSpent ?? 0,
      })));
    })();
  }, []);

  return (
    <div>
      {rows.length === 0 ? (
        <p className="border border-line px-6 py-16 text-center text-fgsoft">No customers yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--t-line)] border-y border-line">
          {rows.map((c) => (
            <li key={c.id}>
              <Link to={`/admin/customers/${c.id}`} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-display">{c.full_name || "Unnamed"}</p>
                  <p className="truncate text-xs text-fgsoft">{c.email ?? "—"} · {c.orders.length} orders</p>
                </div>
                <p className="shrink-0 tabular-nums">{formatPrice(c.totalSpent)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Customer detail + order history. */
export function AdminCustomerDetail() {
  const { id = "" } = useParams();
  const [c, setC] = useState<Customer | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: orders }] = await Promise.all([
        supabase().from("profiles").select("id,full_name,email,phone,created_at").eq("id", id).single(),
        supabase().from("orders").select("id,order_number,total,created_at,order_status").eq("user_id", id).order("created_at", { ascending: false }),
      ]);
      if (p) setC({ ...(p as Omit<Customer, "orders">), orders: (orders ?? []) as Customer["orders"] });
    })();
  }, [id]);

  if (!c) return <p className="text-fgsoft">Loading customer…</p>;
  const last = c.orders[0];

  return (
    <div className="max-w-2xl">
      <Link to="/admin/customers" className="text-sm text-fgsoft underline underline-offset-4">← Customers</Link>
      <h2 className="mt-3 font-display text-2xl">{c.full_name || "Unnamed"}</h2>
      <p className="mt-1 text-sm text-fgsoft">{c.email ?? "—"} · {c.phone ?? "—"}</p>
      <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-fgsoft">
        Joined {new Date(c.created_at).toLocaleDateString("en-IN")} · {c.orders.length} orders
        {last ? ` · last ${new Date(last.created_at).toLocaleDateString("en-IN")}` : ""}
      </p>
      <h3 className="mt-8 font-display text-lg">Order history</h3>
      {c.orders.length === 0 ? (
        <p className="mt-3 text-fgsoft">No orders yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-[var(--t-line)] border-y border-line">
          {c.orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-4 py-3">
              <Link to={`/admin/orders/${o.id}`} className="font-mono text-sm hover:underline">{o.order_number}</Link>
              <span className="text-xs text-fgsoft">{new Date(o.created_at).toLocaleDateString("en-IN")}</span>
              <span className="tabular-nums">{formatPrice(o.total)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
