// Cover King Panipat — order-notify Edge Function
// POST /functions/v1/order-notify  { order_id, new_status, note? }
// Caller must be an admin (verified server-side via JWT + profiles.role).
// Writes the order_event, updates the order, notifies the customer.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VALID = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"];

const TITLES: Record<string, string> = {
  confirmed: "Order confirmed", processing: "Order is being packed", packed: "Order packed",
  shipped: "Order shipped", out_for_delivery: "Out for delivery", delivered: "Delivered",
  cancelled: "Order cancelled", returned: "Return accepted",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors });
  }
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const { data: caller } = await db.auth.getUser(auth.replace("Bearer ", ""));
    if (!caller.user) return Response.json({ error: "Unauthorized" }, { status: 401, headers: cors });
    const { data: profile } = await db.from("profiles").select("role").eq("id", caller.user.id).single();
    if (profile?.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403, headers: cors });

    const { order_id, new_status, note } = await req.json();
    if (!order_id || !VALID.includes(new_status)) {
      return Response.json({ error: "Invalid order or status." }, { status: 400, headers: cors });
    }
    const { data: order } = await db.from("orders").select("*").eq("id", order_id).single();
    if (!order) return Response.json({ error: "Order not found." }, { status: 404, headers: cors });

    // Restore stock when an order is cancelled before shipment.
    if (new_status === "cancelled" && !["shipped", "out_for_delivery", "delivered"].includes(order.order_status)) {
      const { data: items } = await db.from("order_items").select("variant_id,quantity").eq("order_id", order_id);
      for (const it of items ?? []) {
        if (it.variant_id) await db.rpc("release_stock", { p_variant_id: it.variant_id, p_qty: it.quantity });
      }
    }

    await db.from("orders").update({ order_status: new_status }).eq("id", order_id);
    await db.from("order_events").insert({
      order_id, event_type: "status_change", old_status: order.order_status,
      new_status, note: String(note ?? "").slice(0, 500), actor_id: caller.user.id,
    });
    if (order.user_id) {
      await db.from("notifications").insert({
        user_id: order.user_id, order_id, type: `order_${new_status}`,
        title: TITLES[new_status] ?? "Order update",
        message: `Order ${order.order_number}: ${TITLES[new_status] ?? new_status}`,
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey && order.email) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Cover King Panipat <orders@coverkingpanipat.in>",
          to: [order.email],
          subject: `${TITLES[new_status] ?? "Order update"} — ${order.order_number}`,
          text: `Hi ${order.customer_name},\n\nYour order ${order.order_number} is now: ${TITLES[new_status] ?? new_status}.\n\nTrack it anytime from your account.\n\n— Cover King Panipat`,
        });
      } catch (e) {
        console.error("customer email failed", e);
      }
    }

    return Response.json({ ok: true }, { headers: cors });
  } catch (e) {
    console.error("order-notify failed", e);
    return Response.json({ error: "Notification failed." }, { status: 500, headers: cors });
  }
});
