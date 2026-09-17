// Cover King Panipat — place-order Edge Function (Phase 8)
// POST /functions/v1/place-order
// Server is authoritative: prices, stock, coupons and totals are all
// recomputed here. Frontend values are NEVER trusted.
//
// Env (supabase secrets): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//   RESEND_API_KEY (optional), ADMIN_EMAIL (optional)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-idempotency-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CartLine {
  product_id: string;
  variant_id?: string | null;
  qty: number;
}

interface Body {
  customer: {
    name: string; email: string; phone: string;
    address1: string; address2?: string; city: string; state: string; pin: string;
  };
  items: CartLine[];
  coupon_code?: string | null;
  payment_method?: string;
  idempotency_key?: string | null;
  notes?: string;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(SUPABASE_URL, SERVICE_KEY);
  const reserved: { variant: string; qty: number }[] = [];

  try {
    const body = (await req.json()) as Body;
    const c = body.customer ?? {};
    for (const f of ["name", "email", "phone", "address1", "city", "state", "pin"] as const) {
      if (!String((c as Record<string, unknown>)[f] ?? "").trim()) {
        return Response.json({ error: `Missing field: ${f}` }, { status: 400, headers: cors });
      }
    }
    if (!/^\d{6}$/.test(c.pin.trim())) {
      return Response.json({ error: "PIN code must be 6 digits." }, { status: 400, headers: cors });
    }
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
      return Response.json({ error: "Cart is empty or too large." }, { status: 400, headers: cors });
    }
    if ((body.payment_method ?? "cod") !== "cod") {
      return Response.json({ error: "Online payment is coming soon. COD only." }, { status: 400, headers: cors });
    }

    // Idempotency: same key → same order, never a duplicate charge/stock move.
    const idem = (body.idempotency_key ?? "").trim() || null;
    if (idem) {
      const { data: existing } = await db.from("orders").select("id,order_number,total,order_status,payment_status").eq("idempotency_key", idem).maybeSingle();
      if (existing) return Response.json({ order: existing, duplicate: true }, { headers: cors });
    }

    // Caller identity (guest supported — Authorization header optional).
    let userId: string | null = null;
    const auth = req.headers.get("Authorization");
    if (auth) {
      const { data } = await db.auth.getUser(auth.replace("Bearer ", ""));
      userId = data.user?.id ?? null;
    }

    // Settings (single source of truth for shipping).
    const { data: settings } = await db.from("store_settings").select("*").eq("id", 1).single();
    if (!settings?.cod_enabled) {
      return Response.json({ error: "COD is currently disabled." }, { status: 400, headers: cors });
    }

    // Validate lines against live DB rows.
    let subtotal = 0;
    const lines: {
      product_id: string | null; variant_id: string | null;
      product_name: string; variant_name: string; sku: string | null;
      qty: number; unit: number;
    }[] = [];
    for (const line of body.items) {
      const qty = Math.floor(Number(line.qty));
      if (!line.product_id || !(qty >= 1 && qty <= 10)) {
        return Response.json({ error: "Invalid cart line." }, { status: 400, headers: cors });
      }
      const { data: product } = await db.from("products").select("id,name,price,active").eq("id", line.product_id).single();
      if (!product || !product.active) {
        return Response.json({ error: "A product in your bag is no longer available." }, { status: 409, headers: cors });
      }
      let variantName = "";
      let sku: string | null = null;
      let unit = product.price;
      let variantId: string | null = null;
      if (line.variant_id) {
        const { data: variant } = await db.from("product_variants").select("*").eq("id", line.variant_id).eq("product_id", line.product_id).single();
        if (!variant || !variant.active) {
          return Response.json({ error: `"${product.name}" variant is unavailable.` }, { status: 409, headers: cors });
        }
        if (variant.stock < qty) {
          return Response.json({ error: `Only ${variant.stock} left of ${product.name} (${variant.name}).` }, { status: 409, headers: cors });
        }
        variantName = `${variant.name}${variant.phone_model ? ` · ${variant.phone_model}` : ""}`;
        sku = variant.sku;
        if (variant.price != null) unit = variant.price;
        variantId = variant.id;
        // Atomic reserve (row-locked, fails if stock moved underneath us).
        const { data: ok } = await db.rpc("reserve_stock", { p_variant_id: variant.id, p_qty: qty });
        if (!ok) {
          return Response.json({ error: `Just ran out of ${product.name} (${variant.name}).` }, { status: 409, headers: cors });
        }
        reserved.push({ variant: variant.id, qty });
      }
      subtotal += unit * qty;
      lines.push({ product_id: product.id, variant_id: variantId, product_name: product.name, variant_name: variantName, sku, qty, unit });
    }

    // Coupon — validated here, never trusted from the client.
    let discount = 0;
    let couponCode: string | null = null;
    const code = (body.coupon_code ?? "").trim().toUpperCase();
    if (code) {
      const { data: coupon } = await db.from("coupons").select("*").eq("code", code).maybeSingle();
      const usable =
        coupon?.active &&
        (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) &&
        subtotal >= (coupon.minimum_order ?? 0) &&
        (!coupon.usage_limit || (coupon.used_count ?? 0) < coupon.usage_limit);
      if (!usable) {
        for (const r of reserved) await db.rpc("release_stock", { p_variant_id: r.variant, p_qty: r.qty });
        return Response.json({ error: "Coupon is invalid, expired or not applicable." }, { status: 400, headers: cors });
      }
      discount = coupon.discount_type === "percentage"
        ? Math.min(Math.round((subtotal * coupon.discount_value) / 100), coupon.maximum_discount ?? Infinity)
        : Math.min(coupon.discount_value, subtotal);
      couponCode = coupon.code;
      await db.from("coupons").update({ used_count: (coupon.used_count ?? 0) + 1 }).eq("id", coupon.id);
    }

    const shippingFee = subtotal - discount >= (settings.free_shipping_threshold ?? 999) ? 0 : (settings.shipping_fee ?? 79);
    const total = subtotal - discount + shippingFee;

    const orderNumberRes = await db.rpc("next_order_number");
    const { data: order, error: orderErr } = await db.from("orders").insert({
      order_number: orderNumberRes.data as string,
      user_id: userId,
      customer_name: c.name.trim(), email: c.email.trim(), phone: c.phone.trim(),
      address_line_1: c.address1.trim(), address_line_2: (c.address2 ?? "").trim(),
      city: c.city.trim(), state: c.state.trim(), postal_code: c.pin.trim(), country: "India",
      subtotal, shipping_fee: shippingFee, discount, total,
      coupon_code: couponCode, payment_method: "cod", payment_status: "cod_pending",
      order_status: "pending", customer_notes: (body.notes ?? "").slice(0, 500),
      idempotency_key: idem,
    }).select("id,order_number,total,order_status,payment_status").single();
    if (orderErr || !order) {
      for (const r of reserved) await db.rpc("release_stock", { p_variant_id: r.variant, p_qty: r.qty });
      throw new Error(orderErr?.message ?? "Order insert failed");
    }

    await db.from("order_items").insert(lines.map((l) => ({
      order_id: order.id, product_id: l.product_id, variant_id: l.variant_id,
      product_name: l.product_name, variant_name: l.variant_name, sku: l.sku,
      quantity: l.qty, unit_price: l.unit, total_price: l.unit * l.qty,
    })));
    await db.from("payments").insert({
      order_id: order.id, provider: "cod", amount: total, currency: "INR",
      status: "cod_pending", payment_method: "cod",
    });
    await db.from("order_events").insert({
      order_id: order.id, event_type: "created", old_status: null,
      new_status: "pending", note: "COD order placed", actor_id: userId,
    });

    // Notifications: admin inbox row + customer row (if logged in).
    const itemLines = lines.map((l) => `• ${l.product_name}${l.variant_name ? ` (${l.variant_name})` : ""} × ${l.qty} — ${inr(l.unit * l.qty)}`).join("\n");
    const adminMsg = `Order ${order.order_number}\n${c.name} · ${c.phone}\n${itemLines}\nTotal ${inr(total)} (COD)\n${c.address1}, ${c.city} ${c.pin}`;
    await db.from("notifications").insert([
      { user_id: null, order_id: order.id, type: "new_order", title: "New order received", message: adminMsg },
      ...(userId ? [{ user_id: userId, order_id: order.id, type: "order_placed", title: "Order placed", message: `Order ${order.order_number} · ${inr(total)} · COD` }] : []),
    ]);

    // Admin email (Resend). Missing key = logged + skipped, never faked.
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "vegetacoder69@gmail.com";
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Cover King Panipat <orders@coverkingpanipat.in>",
          to: [adminEmail],
          subject: `NEW ORDER RECEIVED — ${order.order_number} · ${inr(total)}`,
          text: `${adminMsg}\n\nView: /admin/orders/${order.id}`,
        });
      } catch (e) {
        console.error("admin email failed", e);
      }
    } else {
      console.log("RESEND_API_KEY not set — admin email skipped for", order.order_number);
    }

    return Response.json({ order }, { headers: cors });
  } catch (e) {
    for (const r of reserved) {
      try {
        const db2 = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        await db2.rpc("release_stock", { p_variant_id: r.variant, p_qty: r.qty });
      } catch { /* best effort */ }
    }
    console.error("place-order failed", e);
    return Response.json({ error: "Unable to place order. Please try again." }, { status: 500, headers: cors });
  }
});
