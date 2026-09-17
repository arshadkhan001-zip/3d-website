import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../data/products";

interface Stats {
  totalOrders: number;
  todayOrders: number;
  revenue: number;
  byStatus: Record<string, number>;
  products: number;
  lowStock: number;
  daily: { day: string; total: number }[];
  topModels: { model: string; qty: number }[];
  topProducts: { name: string; qty: number }[];
}

/** Dashboard: KPIs + revenue chart + status split + top lists. */
export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const db = supabase();
        const [{ data: orders }, { count: productCount }, { data: variants }, { data: recentItems }] = await Promise.all([
          db.from("orders").select("id,total,order_status,created_at").order("created_at", { ascending: false }).limit(500),
          db.from("products").select("id", { count: "exact", head: true }),
          db.from("product_variants").select("stock"),
          db.from("order_items").select("product_name,variant_name,quantity").order("quantity", { ascending: false }).limit(200),
        ]);
        const list = orders ?? [];
        const today = new Date().toISOString().slice(0, 10);
        const byStatus: Record<string, number> = {};
        let revenue = 0;
        const dayMap = new Map<string, number>();
        for (const o of list as { total: number; order_status: string; created_at: string }[]) {
          byStatus[o.order_status] = (byStatus[o.order_status] ?? 0) + 1;
          if (!["cancelled", "returned"].includes(o.order_status)) revenue += o.total;
          const d = o.created_at.slice(0, 10);
          if (!["cancelled", "returned"].includes(o.order_status)) dayMap.set(d, (dayMap.get(d) ?? 0) + o.total);
        }
        const days = [...dayMap.entries()].sort().slice(-14);
        const modelMap = new Map<string, number>();
        const prodMap = new Map<string, number>();
        for (const it of (recentItems ?? []) as { product_name: string; variant_name: string; quantity: number }[]) {
          prodMap.set(it.product_name, (prodMap.get(it.product_name) ?? 0) + it.quantity);
          const m = it.variant_name.split("·").pop()?.trim();
          if (m) modelMap.set(m, (modelMap.get(m) ?? 0) + it.quantity);
        }
        const low = (variants ?? []).filter((v: { stock: number }) => v.stock <= 5).length;
        setS({
          totalOrders: list.length,
          todayOrders: list.filter((o: { created_at: string }) => o.created_at.slice(0, 10) === today).length,
          revenue,
          byStatus,
          products: productCount ?? 0,
          lowStock: low,
          daily: days.map(([day, total]) => ({ day: day.slice(5), total })),
          topModels: [...modelMap.entries()].map(([model, qty]) => ({ model, qty })).sort((a, b) => b.qty - a.qty).slice(0, 5),
          topProducts: [...prodMap.entries()].map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 5),
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard.");
      }
    })();
  }, []);

  if (error) return <p role="alert" className="text-sm text-ember">{error}</p>;
  if (!s) return <p className="text-fgsoft">Loading dashboard…</p>;

  const cards: [string, string][] = [
    ["Total orders", String(s.totalOrders)],
    ["Today's orders", String(s.todayOrders)],
    ["Revenue", formatPrice(s.revenue)],
    ["Pending", String(s.byStatus.pending ?? 0)],
    ["Processing", String((s.byStatus.processing ?? 0) + (s.byStatus.confirmed ?? 0))],
    ["Shipped", String((s.byStatus.shipped ?? 0) + (s.byStatus.out_for_delivery ?? 0))],
    ["Delivered", String(s.byStatus.delivered ?? 0)],
    ["Cancelled", String(s.byStatus.cancelled ?? 0)],
    ["Products", String(s.products)],
    ["Low stock variants", String(s.lowStock)],
  ];
  const maxDay = Math.max(1, ...s.daily.map((d) => d.total));

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={label} className="border border-line bg-raised p-4">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-fgsoft">{label}</p>
            <p className="mt-1 font-display text-2xl tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="border border-line bg-raised p-5">
          <h2 className="font-display text-lg">Revenue — last 14 days</h2>
          {s.daily.length === 0 ? (
            <p className="mt-4 text-sm text-fgsoft">No revenue yet.</p>
          ) : (
            <div className="mt-4 flex h-32 items-end gap-1.5" role="img" aria-label="Revenue by day bar chart">
              {s.daily.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${formatPrice(d.total)}`}>
                  <div className="w-full rounded-sm bg-ember" style={{ height: `${Math.max(4, (d.total / maxDay) * 100)}%` }} />
                  <span className="font-mono text-[0.55rem] text-fgsoft">{d.day.slice(3)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border border-line bg-raised p-5">
          <h2 className="font-display text-lg">Orders by status</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {Object.entries(s.byStatus).sort((a, b) => b[1] - a[1]).map(([st, n]) => (
              <li key={st} className="flex items-center justify-between gap-3">
                <span className="text-fgsoft">{st.replace(/_/g, " ")}</span>
                <span className="tabular-nums">{n}</span>
              </li>
            ))}
            {Object.keys(s.byStatus).length === 0 && <li className="text-fgsoft">No orders yet.</li>}
          </ul>
        </div>
        <div className="border border-line bg-raised p-5">
          <h2 className="font-display text-lg">Top products</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {s.topProducts.map((t) => (
              <li key={t.name} className="flex justify-between gap-3">
                <span className="text-fgsoft">{t.name}</span>
                <span className="tabular-nums">×{t.qty}</span>
              </li>
            ))}
            {s.topProducts.length === 0 && <li className="text-fgsoft">No sales yet.</li>}
          </ul>
        </div>
        <div className="border border-line bg-raised p-5">
          <h2 className="font-display text-lg">Best-selling fits</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {s.topModels.map((t) => (
              <li key={t.model} className="flex justify-between gap-3">
                <span className="text-fgsoft">{t.model}</span>
                <span className="tabular-nums">×{t.qty}</span>
              </li>
            ))}
            {s.topModels.length === 0 && <li className="text-fgsoft">No sales yet.</li>}
          </ul>
          <Link to="/admin/orders" className="mt-4 inline-block text-sm underline underline-offset-4">Open orders →</Link>
        </div>
      </div>
    </div>
  );
}
