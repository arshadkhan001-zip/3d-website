/** Mock order store (localStorage). Replace with backend orders API later. */

export interface OrderItem {
  name: string;
  modelLabel: string;
  variantLabel: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  email: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  phone: string;
  method: string;
  payment: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: number; // index into ORDER_STAGES
}

export const ORDER_STAGES = [
  "Order placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for delivery",
  "Delivered",
] as const;

/** Customer-facing payment labels. COD is NEVER shown as paid. */
export function paymentMethodLabel(method: string): string {
  return method === "cod" ? "Cash on Delivery" : method;
}

export function paymentStatusLabel(status: string): string {
  switch (status) {
    case "cod_pending": return "COD Pending";
    case "cod_collected": return "COD Collected";
    case "paid": return "Paid";
    case "failed": return "Failed";
    case "refunded": return "Refunded";
    default: return "Pending";
  }
}

const KEY = "form-orders-v1";

export function saveOrder(o: Order): void {
  try {
    const raw = localStorage.getItem(KEY);
    const list: Order[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(KEY, JSON.stringify([o, ...list]));
  } catch {
    /* ignore */
  }
}

export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find((o) => o.id.toLowerCase() === id.trim().toLowerCase());
}

export function demoOrder(): Order {
  return {
    id: "DEMO123",
    date: new Date().toISOString(),
    email: "demo@example.in",
    name: "Demo Customer",
    address: "221, MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    pin: "560001",
    phone: "+91 98765 43210",
    method: "Standard (3–5 days)",
    payment: "UPI",
    items: [{ name: "FORM Clear", modelLabel: "iPhone 16", variantLabel: "Clear", qty: 1, price: 799 }],
    subtotal: 799,
    discount: 0,
    shipping: 79,
    total: 878,
    status: 3,
  };
}
