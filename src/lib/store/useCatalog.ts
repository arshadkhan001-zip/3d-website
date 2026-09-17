import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "../supabase";
import { PRODUCTS as LOCAL_PRODUCTS, type Product } from "../../data/products";
import { listProducts } from "./catalog";

/**
 * Instant local catalog first (never a blank screen), upgraded to live
 * Supabase rows when configured. Components render from `products`.
 */
export function useProducts(): { products: Product[]; loading: boolean; live: boolean } {
  const [products, setProducts] = useState<Product[]>(LOCAL_PRODUCTS);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const live = isSupabaseConfigured();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    listProducts()
      .then((list) => {
        if (!cancelled && list.length > 0) setProducts(list);
      })
      .catch(() => {
        /* offline/RLS failure — local catalog stays */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, live };
}

export function useProduct(slug: string): { product: Product | undefined; loading: boolean } {
  const { products, loading } = useProducts();
  return { product: products.find((p) => p.slug === slug), loading };
}
