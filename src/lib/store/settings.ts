import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../supabase";

export interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  currency: string;
  shipping_fee: number;
  free_shipping_threshold: number;
  cod_enabled: boolean;
  online_payments_enabled: boolean;
  low_stock_threshold: number;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  store_name: "Cover King Panipat",
  store_email: "vegetacoder69@gmail.com",
  store_phone: "",
  currency: "INR",
  shipping_fee: 79,
  free_shipping_threshold: 999,
  cod_enabled: true,
  online_payments_enabled: false,
  low_stock_threshold: 5,
};

let cache: StoreSettings | null = null;

/** Live store settings (single DB row) with safe defaults. Checkout/cart read this. */
export function useStoreSettings(): StoreSettings {
  const [s, setS] = useState<StoreSettings>(cache ?? DEFAULT_SETTINGS);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    if (cache) {
      setS(cache);
      return;
    }
    supabase().from("store_settings").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) {
        cache = data as StoreSettings;
        setS(cache);
      }
    });
  }, []);
  return s;
}

export function shippingForTotal(total: number, s: StoreSettings): number {
  if (total <= 0 || total >= s.free_shipping_threshold) return 0;
  return s.shipping_fee;
}
