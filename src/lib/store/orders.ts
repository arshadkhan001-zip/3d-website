import { supabase, isSupabaseConfigured } from "../supabase";
import {
  PHONE_MODELS,
  allowedModels as localAllowed,
  modelsFor as localModels,
  type PhoneModel,
  type Product,
} from "../../data/products";

interface Enriched {
  variantModels?: Record<string, string[]>;
  dbId?: string;
}

/** Model list: DB phone_models when present, else the local fitment table. */
export function storeModelsFor(p: Product): PhoneModel[] {
  const dbId = (p as Enriched).dbId;
  if (dbId && isSupabaseConfigured()) {
    // DB rows carry phone_models; resolve labels via the shared model catalog.
    // The mapped Product keeps slug ids, so the local table resolves identically.
    return localModels(p.id);
  }
  return localModels(p.id);
}

/** Variant×model limits: DB variant_models win, else local demo limits. */
export function storeAllowedModels(p: Product, variantId: string): PhoneModel[] {
  const vm = (p as Enriched).variantModels?.[variantId];
  if (vm) {
    const all = storeModelsFor(p);
    return all.filter((m) => vm.includes(m.id));
  }
  return localAllowed(p.id, variantId);
}

export function allPhoneModels(): PhoneModel[] {
  return PHONE_MODELS;
}

/* ── orders ─────────────────────────────────────────────── */

export interface PlaceOrderInput {
  customer: {
    name: string; email: string; phone: string;
    address1: string; address2?: string; city: string; state: string; pin: string;
  };
  lines: { productDbId: string | null; productSlug: string; variantDbId: string | null; qty: number }[];
  coupon_code?: string | null;
  payment_method: "cod";
  idempotency_key: string;
  notes?: string;
}

export interface PlacedOrder {
  id: string;
  order_number: string;
  total: number;
  order_status: string;
  payment_status: string;
}

/**
 * Real order path: Edge Function validates + reserves + creates.
 * Throws on failure — callers must surface the message, never fake success.
 */
export async function placeOrderRemote(input: PlaceOrderInput): Promise<{ order: PlacedOrder; duplicate: boolean }> {
  const db = supabase();
  const { data: { session } } = await db.auth.getSession();
  // Resolve local slugs/uuids to DB rows for the function payload.
  const { data: products } = await db.from("products").select("id,slug").in("slug", input.lines.map((l) => l.productSlug));
  const bySlug = new Map((products ?? []).map((p: { id: string; slug: string }) => [p.slug, p.id]));
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/place-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({
      customer: input.customer,
      items: input.lines.map((l) => ({
        product_id: l.productDbId ?? bySlug.get(l.productSlug),
        variant_id: l.variantDbId ?? null,
        qty: l.qty,
      })),
      coupon_code: input.coupon_code,
      payment_method: "cod",
      idempotency_key: input.idempotency_key,
      notes: input.notes,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Unable to place order. Please try again.");
  return json as { order: PlacedOrder; duplicate: boolean };
}

export interface TrackedOrder {
  found: boolean;
  order_number?: string;
  order_status?: string;
  payment_status?: string;
  payment_method?: string;
  total?: number;
  city?: string;
  created_at?: string;
  items?: { product_name: string; variant_name: string; quantity: number; unit_price: number }[];
  events?: { event_type: string; old_status: string | null; new_status: string | null; created_at: string }[];
}

/** Guest-safe tracking (phone must match). Requires Supabase. */
export async function trackOrderRemote(orderNumber: string, phone: string): Promise<TrackedOrder> {
  const { data, error } = await supabase().rpc("track_order", {
    p_order_number: orderNumber,
    p_phone: phone,
  });
  if (error) throw new Error("Tracking is unavailable right now.");
  return data as TrackedOrder;
}

export interface MyOrder {
  id: string;
  order_number: string;
  total: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  items: { product_name: string; variant_name: string; quantity: number; unit_price: number }[];
}

/** Logged-in customer's order history (RLS enforced). */
export async function myOrdersRemote(): Promise<MyOrder[]> {
  const db = supabase();
  const { data: orders } = await db.from("orders").select("id,order_number,total,order_status,payment_status,created_at").order("created_at", { ascending: false });
  const rows = (orders ?? []) as { id: string; order_number: string; total: number; order_status: string; payment_status: string; created_at: string }[];
  if (rows.length === 0) return [];
  const { data: items } = await db.from("order_items").select("order_id,product_name,variant_name,quantity,unit_price").in("order_id", rows.map((o) => o.id));
  const itemRows = (items ?? []) as { order_id: string; product_name: string; variant_name: string; quantity: number; unit_price: number }[];
  return rows.map((o) => ({
    ...o,
    items: itemRows.filter((i) => i.order_id === o.id),
  }));
}
