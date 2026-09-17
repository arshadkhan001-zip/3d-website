import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/utilities/utils";

const inputCls = "h-11 w-full rounded-[10px] border border-line bg-transparent px-3 text-sm placeholder:text-fgsoft/70 focus:border-fg focus:outline-none";

/** Store settings: single source of truth for shipping, COD, payments. */
export default function Settings() {
  const [f, setF] = useState({
    store_name: "", store_email: "", store_phone: "", currency: "INR",
    shipping_fee: "79", free_shipping_threshold: "999",
    cod_enabled: true, online_payments_enabled: false, low_stock_threshold: "5",
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase().from("store_settings").select("*").eq("id", 1).single();
      if (data) {
        setF({
          store_name: data.store_name, store_email: data.store_email, store_phone: data.store_phone ?? "",
          currency: data.currency, shipping_fee: String(data.shipping_fee),
          free_shipping_threshold: String(data.free_shipping_threshold),
          cod_enabled: data.cod_enabled, online_payments_enabled: data.online_payments_enabled,
          low_stock_threshold: String(data.low_stock_threshold),
        });
      }
    })();
  }, []);

  const save = async () => {
    setBusy(true);
    setMsg("");
    const { error } = await supabase().from("store_settings").update({
      store_name: f.store_name.trim() || "Cover King Panipat",
      store_email: f.store_email.trim(),
      store_phone: f.store_phone.trim(),
      currency: f.currency.trim() || "INR",
      shipping_fee: Math.max(0, Number(f.shipping_fee) || 0),
      free_shipping_threshold: Math.max(0, Number(f.free_shipping_threshold) || 0),
      cod_enabled: f.cod_enabled,
      online_payments_enabled: f.online_payments_enabled,
      low_stock_threshold: Math.max(0, Number(f.low_stock_threshold) || 0),
    }).eq("id", 1);
    setBusy(false);
    setMsg(error ? "Save failed." : "Saved — checkout reads these values live.");
  };

  return (
    <div className="max-w-2xl">
      <div className="grid gap-3 sm:grid-cols-2">
        {([
          ["store_name", "Store name"], ["store_email", "Store email"],
          ["store_phone", "Store phone"], ["currency", "Currency"],
          ["shipping_fee", "Shipping fee (₹)"], ["free_shipping_threshold", "Free shipping above (₹)"],
          ["low_stock_threshold", "Low-stock threshold"],
        ] as const).map(([k, label]) => (
          <label key={k} className="block text-xs text-fgsoft">{label}
            <input value={f[k] as string} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={cn(inputCls, "mt-1")} />
          </label>
        ))}
        <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-[10px] border border-line px-4 text-sm">
          <input type="checkbox" checked={f.cod_enabled} onChange={(e) => setF({ ...f, cod_enabled: e.target.checked })} className="h-4 w-4 accent-[#E0762E]" />
          COD enabled
        </label>
        <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-[10px] border border-line px-4 text-sm">
          <input type="checkbox" checked={f.online_payments_enabled} onChange={(e) => setF({ ...f, online_payments_enabled: e.target.checked })} className="h-4 w-4 accent-[#E0762E]" />
          Online payments enabled
        </label>
      </div>
      <p className="mt-3 text-xs text-fgsoft">
        Online payments stay off until a legitimate gateway is connected — the storefront shows “Coming soon” while disabled.
      </p>
      {msg && <p role="status" className="mt-4 text-sm text-fgsoft">{msg}</p>}
      <button type="button" onClick={() => void save()} disabled={busy} className="mt-4 inline-flex min-h-[52px] items-center rounded-full bg-snow px-10 font-medium text-ink disabled:opacity-60">
        {busy ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}
