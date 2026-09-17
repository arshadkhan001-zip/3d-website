import { supabase, isSupabaseConfigured } from "../supabase";
import {
  PRODUCTS as LOCAL_PRODUCTS,
  PHONE_MODELS,
  type Product,
} from "../../data/products";

/** DB row shapes (subset of columns we read). */
interface DbProduct {
  id: string; name: string; slug: string; description: string;
  price: number; compare_at_price: number | null; category: string;
  series: string; material: string; tags: string[]; brands: string[];
  badge: string | null; phone_models: string[]; rating: number;
  reviews_count: number; active: boolean; featured: boolean;
}
interface DbVariant {
  id: string; product_id: string; name: string; color: string;
  stock: number; active: boolean; variant_models: string[] | null;
}
interface DbImage { product_id: string; image_url: string; sort_order: number }

function parseFinish(url: string | undefined, fallback: [string, string]): [string, string] {
  if (url?.startsWith("gradient:")) {
    const parts = url.split(":");
    if (parts.length >= 3) return [parts[1], parts[2]];
  }
  return fallback;
}

function modelLabels(ids: string[]): string[] {
  if (ids.length === 0) return ["Universal fit"];
  return ids
    .map((id) => PHONE_MODELS.find((m) => m.id === id)?.label)
    .filter((x): x is string => Boolean(x));
}

function toProduct(
  row: DbProduct,
  variants: DbVariant[],
  images: DbImage[],
  index: number
): Product & { dbId: string; stockByVariant: Record<string, number>; variantModels: Record<string, string[]> } {
  const img = images.filter((i) => i.product_id === row.id).sort((a, b) => a.sort_order - b.sort_order)[0];
  const local = LOCAL_PRODUCTS.find((p) => p.slug === row.slug);
  const finish = parseFinish(img?.image_url, local?.finish ?? ["#3A4356", "#0C0F16"]);
  const totalStock = variants.filter((v) => v.product_id === row.id && v.active).reduce((n, v) => n + v.stock, 0);
  const stockByVariant: Record<string, number> = {};
  const variantModels: Record<string, string[]> = {};
  for (const v of variants) {
    if (v.product_id !== row.id) continue;
    stockByVariant[v.id] = v.stock;
    if (v.variant_models) variantModels[v.id] = v.variant_models;
  }
  return {
    id: row.slug,
    slug: row.slug,
    index: String(index + 1).padStart(2, "0"),
    name: row.name,
    series: row.series,
    description: row.description,
    price: row.price,
    compareAt: row.compare_at_price ?? undefined,
    currency: "INR",
    compatibility: modelLabels(row.phone_models),
    category: row.category,
    brands: row.brands as Product["brands"],
    tags: row.tags as Product["tags"],
    material: row.material,
    badge: row.badge ?? undefined,
    availability: totalStock <= 0 ? "preorder" : totalStock <= 5 ? "low-stock" : "in-stock",
    variants: variants.filter((v) => v.product_id === row.id && v.active).map((v) => ({ id: v.id, label: v.name, hex: v.color })),
    finish,
    dbId: row.id,
    stockByVariant,
    variantModels,
  };
}

let cache: Product[] | null = null;

/** DB-first product list; falls back to the local catalog when offline/unconfigured. */
export async function listProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return LOCAL_PRODUCTS;
  if (cache) return cache;
  const db = supabase();
  const [{ data: rows }, { data: variants }, { data: images }] = await Promise.all([
    db.from("products").select("*").eq("active", true).order("created_at"),
    db.from("product_variants").select("*"),
    db.from("product_images").select("*"),
  ]);
  if (!rows) return LOCAL_PRODUCTS;
  cache = rows.map((r, i) => toProduct(r as DbProduct, (variants ?? []) as DbVariant[], (images ?? []) as DbImage[], i));
  return cache;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await listProducts()).find((p) => p.slug === slug);
}

export function clearCatalogCache(): void {
  cache = null;
}

/** Live stock check for a variant (DB mode; local mode trusts the demo data). */
export async function checkStock(productId: string, variantId: string, qty: number): Promise<{ ok: boolean; available: number }> {
  if (!isSupabaseConfigured()) return { ok: true, available: 99 };
  const db = supabase();
  const list = await listProducts();
  const p = list.find((x) => x.id === productId) as (Product & { dbId?: string }) | undefined;
  const dbId = p?.dbId;
  if (!dbId) return { ok: true, available: 99 };
  const { data } = await db.from("product_variants").select("stock").eq("id", variantId).eq("product_id", dbId).single();
  const available = data?.stock ?? 0;
  return { ok: available >= qty, available };
}
