import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  series: string;
  modelId: string;
  modelLabel: string;
  variantId: string;
  variantLabel: string;
  hex: string;
  price: number;
  qty: number;
  finish: [string, string];
}

export interface AddToCartInput {
  productId: string;
  slug: string;
  name: string;
  series: string;
  modelId: string;
  modelLabel: string;
  variantId: string;
  variantLabel: string;
  hex: string;
  price: number;
  qty: number;
  finish: [string, string];
}

interface Toast {
  id: number;
  message: string;
  kind: "ok" | "error";
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  coupon: string | null;
  toast: Toast | null;
  cartOpen: boolean;
  add: (input: AddToCartInput) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clearToast: () => void;
  notify: (message: string, kind?: "ok" | "error") => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  clear: () => void;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "form-cart-v1";
const MAX_QTY = 10;

export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FLAT = 79;

/** 0 when the order ships free (or is empty), flat rate otherwise. */
export function shippingFor(total: number): number {
  if (total <= 0 || total >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_FLAT;
}

const COUPONS: Record<string, number> = {
  FORM10: 0.1,
  WELCOME15: 0.15,
};

interface Stored {
  items: CartItem[];
  coupon: string | null;
}

function load(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], coupon: null };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return { items: parsed, coupon: null }; // legacy shape
    if (parsed && Array.isArray(parsed.items)) {
      return {
        items: parsed.items,
        coupon: typeof parsed.coupon === "string" ? parsed.coupon : null,
      };
    }
    return { items: [], coupon: null };
  } catch {
    return { items: [], coupon: null };
  }
}

/** Frontend-only cart (localStorage). No checkout/backend — later stage. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<Stored>(() =>
    typeof window === "undefined" ? { items: [], coupon: null } : load()
  );
  const { items, coupon } = stored;
  const [toast, setToast] = useState<Toast | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* storage unavailable — cart still works in memory */
    }
  }, [stored]);

  const setItems = useCallback(
    (updater: (prev: CartItem[]) => CartItem[]) =>
      setStored((prev) => ({ ...prev, items: updater(prev.items) })),
    []
  );

  const add = useCallback((input: AddToCartInput) => {
    const key = `${input.productId}__${input.modelId}__${input.variantId}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + input.qty) } : i
        );
      }
      return [...prev, { ...input, key, qty: Math.min(MAX_QTY, Math.max(1, input.qty)) }];
    });
    setToast({ id: Date.now(), message: `Added to bag — ${input.name} × ${input.qty}`, kind: "ok" });
  }, []);

  const notify = useCallback((message: string, kind: "ok" | "error" = "ok") => {
    setToast({ id: Date.now(), message, kind });
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.key === key ? { ...i, qty: Math.min(MAX_QTY, Math.max(1, qty)) } : i
      )
    );
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const applyCoupon = useCallback((code: string) => {    const normalized = code.trim().toUpperCase();
    if (!COUPONS[normalized]) return false;
    setStored((prev) => ({ ...prev, coupon: normalized }));
    setToast({ id: Date.now(), message: `Coupon applied — ${normalized}`, kind: "ok" });
    return true;
  }, []);

  const removeCoupon = useCallback(() => {
    setStored((prev) => ({ ...prev, coupon: null }));
  }, []);

  const clear = useCallback(() => {
    setStored((prev) => ({ ...prev, items: [] }));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
    const rate = coupon ? COUPONS[coupon] ?? 0 : 0;
    const discount = Math.round(subtotal * rate);
    const total = subtotal - discount;
    return {
      items, count, subtotal, discount, total, coupon,
      toast, cartOpen, add, remove, setQty, clearToast, notify,
      applyCoupon, removeCoupon, clear, setCartOpen,
    };
  }, [items, coupon, toast, cartOpen, add, remove, setQty, clearToast, notify, applyCoupon, removeCoupon, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
