import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Row { id: string; name: string; color: string; stock: number; product: { name: string } | null }

/** Inventory: stock states + inline editing + low-stock threshold. */
export default function Inventory() {
  const [rows, setRows] = useState<Row[]>([]);
  const [threshold, setThreshold] = useState(5);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    const [{ data: vs }, { data: settings }] = await Promise.all([
      supabase().from("product_variants").select("id,name,color,stock,product:products(name)").order("stock"),
      supabase().from("store_settings").select("low_stock_threshold").eq("id", 1).single(),
    ]);
    setRows((((vs ?? []) as unknown as { id: string; name: string; color: string; stock: number; product: { name: string } | { name: string }[] }[]).map((v) => ({ ...v, product: Array.isArray(v.product) ? v.product[0] ?? null : v.product })) as Row[]));
    if (settings) setThreshold(settings.low_stock_threshold ?? 5);
  };

  useEffect(() => {
    void load();
  }, []);

  const setStock = async (id: string, stock: number) => {
    setSaving(id);
    await supabase().from("product_variants").update({ stock: Math.max(0, stock) }).eq("id", id);
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, stock: Math.max(0, stock) } : r)));
    setSaving(null);
  };

  const saveThreshold = async (v: number) => {
    setThreshold(v);
    await supabase().from("store_settings").update({ low_stock_threshold: v }).eq("id", 1);
  };

  const list = rows.filter((r) =>
    filter === "all" ? true : filter === "out" ? r.stock === 0 : r.stock > 0 && r.stock <= threshold
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Stock filter" className="flex gap-2">
          {(["all", "low", "out"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f}
              className={`min-h-[44px] rounded-full border px-5 text-sm ${filter === f ? "border-fg" : "border-line text-fgsoft"}`}>
              {f === "all" ? "All" : f === "low" ? "Low stock" : "Out of stock"}
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-2 text-sm text-fgsoft">
          Low-stock at
          <input type="number" min={0} value={threshold} onChange={(e) => void saveThreshold(Number(e.target.value) || 0)}
            className="h-10 w-20 rounded-[10px] border border-line bg-transparent px-3 text-sm tabular-nums focus:border-fg focus:outline-none" />
        </label>
      </div>

      <ul className="mt-6 divide-y divide-[var(--t-line)] border-y border-line">
        {list.map((r) => (
          <li key={r.id} className="flex items-center gap-4 py-3">
            <span aria-hidden="true" className="h-8 w-8 shrink-0 rounded-full border border-line" style={{ backgroundColor: r.color }} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display">{r.product?.name ?? "—"} · {r.name}</p>
              <p className={`font-mono text-[0.65rem] uppercase tracking-[0.16em] ${r.stock === 0 ? "text-ember" : r.stock <= threshold ? "text-amber-400" : "text-fgsoft"}`}>
                {r.stock === 0 ? "Out of stock" : r.stock <= threshold ? `Low — ${r.stock} left` : `In stock — ${r.stock}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" aria-label={`Decrease stock of ${r.name}`} onClick={() => void setStock(r.id, r.stock - 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-line">−</button>
              <span className="min-w-8 text-center tabular-nums">{saving === r.id ? "…" : r.stock}</span>
              <button type="button" aria-label={`Increase stock of ${r.name}`} onClick={() => void setStock(r.id, r.stock + 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-line">+</button>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-8 text-fgsoft">Nothing in this bucket.</p>}
    </div>
  );
}
