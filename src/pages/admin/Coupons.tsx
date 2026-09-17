import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/utilities/utils";

interface Coupon {
  id: string; code: string; discount_type: "percentage" | "fixed";
  discount_value: number; minimum_order: number; maximum_discount: number | null;
  usage_limit: number | null; used_count: number; active: boolean; expires_at: string | null;
}

const inputCls = "h-11 w-full rounded-[10px] border border-line bg-transparent px-3 text-sm placeholder:text-fgsoft/70 focus:border-fg focus:outline-none";

/** Coupon CRUD with server-side rules. */
export default function Coupons() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: "", type: "percentage", value: "10", min: "0", max: "", limit: "", expires: "", active: true });
  const [msg, setMsg] = useState("");

  const load = async () => {
    const { data } = await supabase().from("coupons").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as Coupon[]);
  };
  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    setMsg("");
    const code = form.code.trim().toUpperCase();
    if (!/^[A-Z0-9]{3,20}$/.test(code)) {
      setMsg("Code must be 3–20 letters/digits.");
      return;
    }
    const { error } = await supabase().from("coupons").insert({
      code,
      discount_type: form.type,
      discount_value: Number(form.value) || 0,
      minimum_order: Number(form.min) || 0,
      maximum_discount: form.max === "" ? null : Number(form.max),
      usage_limit: form.limit === "" ? null : Number(form.limit),
      expires_at: form.expires === "" ? null : new Date(form.expires).toISOString(),
      active: form.active,
    });
    if (error) setMsg(error.message.includes("duplicate") ? "Code already exists." : "Create failed.");
    else {
      setForm({ code: "", type: "percentage", value: "10", min: "0", max: "", limit: "", expires: "", active: true });
      void load();
    }
  };

  const toggle = async (c: Coupon) => {
    await supabase().from("coupons").update({ active: !c.active }).eq("id", c.id);
    void load();
  };

  const remove = async (c: Coupon) => {
    if (!window.confirm(`Delete coupon ${c.code}? Used ${c.used_count}× — history keeps the code snapshot.`)) return;
    const { error } = await supabase().from("coupons").delete().eq("id", c.id);
    if (error) setMsg("Delete failed.");
    else void load();
  };

  return (
    <div className="max-w-3xl">
      <h2 className="font-display text-xl">New coupon</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CODE" aria-label="Coupon code" className={cn(inputCls, "font-mono uppercase")} />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} aria-label="Discount type" className={cn(inputCls, "[&>option]:bg-abyss")}>
          <option value="percentage">Percentage %</option>
          <option value="fixed">Fixed ₹</option>
        </select>
        <input value={form.value} inputMode="numeric" onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Value" aria-label="Discount value" className={inputCls} />
        <input value={form.min} inputMode="numeric" onChange={(e) => setForm({ ...form, min: e.target.value })} placeholder="Min order ₹" aria-label="Minimum order" className={inputCls} />
        <input value={form.max} inputMode="numeric" onChange={(e) => setForm({ ...form, max: e.target.value })} placeholder="Max discount ₹" aria-label="Maximum discount" className={inputCls} />
        <input value={form.limit} inputMode="numeric" onChange={(e) => setForm({ ...form, limit: e.target.value })} placeholder="Usage limit" aria-label="Usage limit" className={inputCls} />
        <input type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} aria-label="Expiry date" className={cn(inputCls, "sm:col-span-2")} />
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-[#E0762E]" /> Active
        </label>
      </div>
      {msg && <p role="alert" className="mt-3 text-sm text-ember">{msg}</p>}
      <button type="button" onClick={() => void create()} className="mt-4 inline-flex min-h-[48px] items-center rounded-full bg-snow px-8 text-sm font-medium text-ink">
        Create coupon
      </button>

      <ul className="mt-8 divide-y divide-[var(--t-line)] border-y border-line">
        {rows.map((c) => (
          <li key={c.id} className="flex items-center gap-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-mono">{c.code}</p>
              <p className="text-xs text-fgsoft">
                {c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`} · min ₹{c.minimum_order}
                {c.maximum_discount ? ` · cap ₹${c.maximum_discount}` : ""} · used {c.used_count}{c.usage_limit ? `/${c.usage_limit}` : ""} · {c.expires_at ? `expires ${new Date(c.expires_at).toLocaleDateString("en-IN")}` : "no expiry"}
              </p>
            </div>
            <button type="button" onClick={() => void toggle(c)} aria-pressed={c.active}
              className={cn("rounded-full border px-4 py-2 font-mono text-[0.65rem] uppercase", c.active ? "border-line text-fgsoft" : "border-ember/60 text-ember")}>
              {c.active ? "Active" : "Off"}
            </button>
            <button type="button" onClick={() => void remove(c)} aria-label={`Delete ${c.code}`} className="flex h-10 w-10 items-center justify-center rounded-full text-fgsoft hover:text-fg">×</button>
          </li>
        ))}
        {rows.length === 0 && <li className="py-8 text-center text-fgsoft">No coupons yet.</li>}
      </ul>
    </div>
  );
}
