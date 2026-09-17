import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../data/products";
import { cn } from "../../lib/utilities/utils";

interface Row { id: string; name: string; slug: string; price: number; active: boolean; featured: boolean; category: string }
interface VariantEdit { id?: string; name: string; color: string; stock: string; sku: string; models: string }

const inputCls = "h-11 w-full rounded-[10px] border border-line bg-transparent px-3 text-sm placeholder:text-fgsoft/70 focus:border-fg focus:outline-none";

/** Product list with active toggle. */
export function AdminProducts() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase().from("products").select("id,name,slug,price,active,featured,category").order("created_at");
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };
  useEffect(() => {
    void load();
  }, []);

  const toggleActive = async (r: Row) => {
    await supabase().from("products").update({ active: !r.active }).eq("id", r.id);
    void load();
  };

  const list = rows.filter((r) => !q.trim() || `${r.name} ${r.slug} ${r.category}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" aria-label="Search products"
          className="h-11 min-w-0 flex-1 rounded-full border border-line bg-transparent px-5 text-sm placeholder:text-fgsoft/70 focus:border-fg focus:outline-none" />
        <Link to="/admin/products/new" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-snow px-6 text-sm font-medium text-ink">
          + New product
        </Link>
      </div>
      {loading ? <p className="mt-8 text-fgsoft">Loading…</p> : (
        <ul className="mt-6 divide-y divide-[var(--t-line)] border-y border-line">
          {list.map((r) => (
            <li key={r.id} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <Link to={`/admin/products/${r.id}`} className="font-display hover:underline">{r.name}</Link>
                <p className="text-xs text-fgsoft">{r.slug} · {r.category} · {formatPrice(r.price)}{r.featured ? " · Featured" : ""}</p>
              </div>
              <button type="button" onClick={() => void toggleActive(r)} aria-pressed={r.active}
                className={cn("rounded-full border px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.14em]", r.active ? "border-line text-fgsoft" : "border-ember/60 text-ember")}>
                {r.active ? "Active" : "Hidden"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const EMPTY = {
  name: "", slug: "", description: "", price: "", compare_at_price: "",
  category: "Cases", series: "", material: "", tags: "", brands: "",
  badge: "", phone_models: "", active: true, featured: false, images: "",
};

/** Create/edit product with variants, images, stock. */
export function AdminProductEdit() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [f, setF] = useState(EMPTY);
  const [variants, setVariants] = useState<VariantEdit[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const db = supabase();
      const { data: p } = await db.from("products").select("*").eq("id", id).single();
      if (!p) return;
      setF({
        name: p.name, slug: p.slug, description: p.description ?? "", price: String(p.price),
        compare_at_price: p.compare_at_price != null ? String(p.compare_at_price) : "",
        category: p.category, series: p.series ?? "", material: p.material ?? "",
        tags: (p.tags ?? []).join(", "), brands: (p.brands ?? []).join(", "),
        badge: p.badge ?? "", phone_models: (p.phone_models ?? []).join(", "),
        active: p.active, featured: p.featured, images: "",
      });
      const [{ data: vs }, { data: imgs }] = await Promise.all([
        db.from("product_variants").select("*").eq("product_id", id),
        db.from("product_images").select("*").eq("product_id", id).order("sort_order"),
      ]);
      setVariants((vs ?? []).map((v: { id: string; name: string; color: string; stock: number; sku: string | null; variant_models: string[] | null }) => ({
        id: v.id, name: v.name, color: v.color, stock: String(v.stock), sku: v.sku ?? "", models: (v.variant_models ?? []).join(", "),
      })));
      setF((prev) => ({ ...prev, images: ((imgs ?? []) as { image_url: string }[]).map((i) => i.image_url).join("\n") }));
    })();
  }, [id, isNew]);

  const set = (k: keyof typeof EMPTY, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setMsg(null);
    const price = Number(f.price);
    if (f.name.trim().length < 2 || !/^[a-z0-9-]+$/.test(f.slug.trim()) || !(price >= 0)) {
      setMsg({ kind: "error", text: "Name, URL-safe slug and valid price are required." });
      return;
    }
    setBusy(true);
    try {
      const db = supabase();
      const row = {
        name: f.name.trim(), slug: f.slug.trim().toLowerCase(), description: f.description.trim(),
        price, compare_at_price: f.compare_at_price === "" ? null : Number(f.compare_at_price),
        category: f.category.trim() || "Cases", series: f.series.trim(), material: f.material.trim(),
        tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
        brands: f.brands.split(",").map((t) => t.trim()).filter(Boolean),
        badge: f.badge.trim() || null,
        phone_models: f.phone_models.split(",").map((t) => t.trim()).filter(Boolean),
        active: f.active, featured: f.featured,
      };
      let pid = id;
      if (isNew) {
        const { data, error } = await db.from("products").insert(row).select("id").single();
        if (error) throw error;
        pid = data.id;
      } else {
        const { error } = await db.from("products").update(row).eq("id", id);
        if (error) throw error;
      }
      // Replace variants + images wholesale (order items keep snapshots, never FKs).
      const existing = await db.from("product_variants").select("id").eq("product_id", pid);
      const keep = new Set(variants.filter((v) => v.id).map((v) => v.id));
      for (const ex of (existing.data ?? []) as { id: string }[]) {
        if (!keep.has(ex.id)) {
          const { count } = await db.from("order_items").select("id", { count: "exact", head: true }).eq("variant_id", ex.id);
          if ((count ?? 0) > 0) throw new Error("A removed variant exists on past orders — deactivate instead of deleting.");
          await db.from("product_variants").delete().eq("id", ex.id);
        }
      }
      for (const v of variants) {
        const payload = {
          product_id: pid, name: v.name.trim() || "Default", color: v.color.trim() || "#888888",
          stock: Math.max(0, Number(v.stock) || 0), sku: v.sku.trim() || null,
          variant_models: v.models.split(",").map((t) => t.trim()).filter(Boolean),
          active: true,
        };
        if (v.id) {
          const { error } = await db.from("product_variants").update(payload).eq("id", v.id);
          if (error) throw error;
        } else {
          const { error } = await db.from("product_variants").insert(payload);
          if (error) throw error;
        }
      }
      await db.from("product_images").delete().eq("product_id", pid);
      const urls = f.images.split("\n").map((u) => u.trim()).filter(Boolean);
      if (urls.length > 0) {
        const { error } = await db.from("product_images").insert(urls.map((u, i) => ({ product_id: pid, image_url: u, sort_order: i })));
        if (error) throw error;
      }
      setMsg({ kind: "ok", text: "Saved." });
      if (isNew) navigate(`/admin/products/${pid}`, { replace: true });
    } catch (e) {
      setMsg({ kind: "error", text: e instanceof Error ? e.message : "Save failed." });
    } finally {
      setBusy(false);
    }
  };

  const blank = { name: "", color: "#888888", stock: "10", sku: "", models: "" };

  return (
    <div className="max-w-3xl">
      <Link to="/admin/products" className="text-sm text-fgsoft underline underline-offset-4">← Products</Link>
      <h2 className="mt-3 font-display text-2xl">{isNew ? "New product" : "Edit product"}</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {([
          ["name", "Name"], ["slug", "Slug (url-safe)"], ["price", "Price (₹)"], ["compare_at_price", "Compare-at (₹, optional)"],
          ["category", "Category"], ["series", "Series"], ["material", "Material"], ["badge", "Badge (optional)"],
        ] as const).map(([k, label]) => (
          <label key={k} className="block text-xs text-fgsoft">{label}
            <input value={f[k] as string} onChange={(e) => set(k, e.target.value)} className={cn(inputCls, "mt-1")} />
          </label>
        ))}
        <label className="block text-xs text-fgsoft sm:col-span-2">Description
          <textarea value={f.description} onChange={(e) => set("description", e.target.value)} rows={3} className={cn(inputCls, "h-auto py-3")} />
        </label>
        <label className="block text-xs text-fgsoft">Tags (comma separated)<input value={f.tags} onChange={(e) => set("tags", e.target.value)} className={cn(inputCls, "mt-1")} /></label>
        <label className="block text-xs text-fgsoft">Brands (comma separated)<input value={f.brands} onChange={(e) => set("brands", e.target.value)} className={cn(inputCls, "mt-1")} /></label>
        <label className="block text-xs text-fgsoft sm:col-span-2">Phone models (comma separated ids — empty = universal)<input value={f.phone_models} onChange={(e) => set("phone_models", e.target.value)} className={cn(inputCls, "mt-1")} /></label>
        <label className="block text-xs text-fgsoft sm:col-span-2">Images (one URL per line, or gradient:#AAA:#BBB)<textarea value={f.images} onChange={(e) => set("images", e.target.value)} rows={2} className={cn(inputCls, "h-auto py-3 font-mono")} /></label>
        <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-[#E0762E]" /> Active (visible in store)</label>
        <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-[#E0762E]" /> Featured</label>
      </div>

      <h3 className="mt-8 font-display text-xl">Variants & stock</h3>
      <div className="mt-3 space-y-3">
        {variants.map((v, i) => (
          <div key={v.id ?? `new-${i}`} className="grid grid-cols-2 gap-2 border border-line p-3 sm:grid-cols-5">
            <input value={v.name} onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Name" aria-label="Variant name" className={inputCls} />
            <input value={v.color} onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, color: e.target.value } : x)))} placeholder="#hex" aria-label="Variant color" className={inputCls} />
            <input value={v.stock} inputMode="numeric" onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, stock: e.target.value } : x)))} placeholder="Stock" aria-label="Variant stock" className={inputCls} />
            <input value={v.sku} onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, sku: e.target.value } : x)))} placeholder="SKU" aria-label="Variant SKU" className={inputCls} />
            <div className="col-span-2 flex gap-2 sm:col-span-1">
              <input value={v.models} onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, models: e.target.value } : x)))} placeholder="model ids" aria-label="Limited models" className={cn(inputCls, "font-mono")} />
              <button type="button" onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))} aria-label="Remove variant" className="h-11 w-11 shrink-0 rounded-[10px] border border-line text-fgsoft hover:text-fg">×</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setVariants((vs) => [...vs, { ...blank }])} className="inline-flex min-h-[44px] items-center rounded-full border border-line px-6 text-sm">
          + Add variant
        </button>
      </div>

      {msg && <p role={msg.kind === "error" ? "alert" : "status"} className={cn("mt-6 text-sm", msg.kind === "error" ? "text-ember" : "text-fgsoft")}>{msg.text}</p>}
      <button type="button" onClick={() => void save()} disabled={busy} className="mt-4 inline-flex min-h-[52px] items-center rounded-full bg-snow px-10 font-medium text-ink disabled:opacity-60">
        {busy ? "Saving…" : "Save product"}
      </button>
    </div>
  );
}
