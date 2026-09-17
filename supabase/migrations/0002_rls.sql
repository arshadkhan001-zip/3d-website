-- Cover King Panipat — RLS + access control (Phase 4)
-- Service-role key bypasses RLS (used ONLY in Edge Functions, never frontend).

-- ── admin check (server-side, never frontend-only) ───────
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.order_events enable row level security;
alter table public.store_settings enable row level security;

-- ── profiles ─────────────────────────────────────────────
create policy profiles_read_own on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
-- Role escalation guard: customers cannot make themselves admin.
create policy profiles_insert_own on public.profiles for insert
  with check (id = auth.uid() and role = 'customer');
create policy profiles_admin_all on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- ── catalog (public reads active rows; admin writes) ─────
create policy products_public_read on public.products for select
  using (active or public.is_admin());
create policy products_admin_write on public.products for all
  using (public.is_admin()) with check (public.is_admin());

create policy images_public_read on public.product_images for select
  using (true);
create policy images_admin_write on public.product_images for all
  using (public.is_admin()) with check (public.is_admin());

-- Stock levels are visible (needed for availability UI); only admin edits.
create policy variants_public_read on public.product_variants for select
  using (true);
create policy variants_admin_write on public.product_variants for all
  using (public.is_admin()) with check (public.is_admin());

-- ── coupons (sensitive table locked; safe view is public) ──
create policy coupons_admin on public.coupons for all
  using (public.is_admin()) with check (public.is_admin());
grant select on public.coupon_public to anon, authenticated;

-- ── orders (customers see ONLY their own) ─────────────────
create policy orders_read_own on public.orders for select
  using (user_id = auth.uid() or public.is_admin());
-- Guests create orders only through the place-order Edge Function
-- (service role). No direct inserts.
create policy orders_admin_write on public.orders for all
  using (public.is_admin()) with check (public.is_admin());

create policy items_read_via_order on public.order_items for select
  using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy items_admin_write on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());

create policy payments_admin on public.payments for all
  using (public.is_admin()) with check (public.is_admin());

-- ── notifications ────────────────────────────────────────
create policy notifications_read_own on public.notifications for select
  using (user_id = auth.uid() or user_id is null or public.is_admin());
create policy notifications_update_own on public.notifications for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy notifications_admin_all on public.notifications for all
  using (public.is_admin()) with check (public.is_admin());

-- ── order events ─────────────────────────────────────────
create policy events_read_via_order on public.order_events for select
  using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );
create policy events_admin_write on public.order_events for all
  using (public.is_admin()) with check (public.is_admin());

-- ── store settings ───────────────────────────────────────
create policy settings_public_read on public.store_settings for select
  using (true);
create policy settings_admin_write on public.store_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- ── guest tracking (limited fields, phone must match) ────
create or replace function public.track_order(p_order_number text, p_phone text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  o record;
  items jsonb;
  events jsonb;
begin
  select * into o from public.orders
    where order_number = upper(trim(p_order_number))
      and regexp_replace(phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g');
  if not found then
    return jsonb_build_object('found', false);
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'product_name', product_name, 'variant_name', variant_name,
    'quantity', quantity, 'unit_price', unit_price
  ) order by product_name), '[]'::jsonb) into items
    from public.order_items where order_id = o.id;
  select coalesce(jsonb_agg(jsonb_build_object(
    'event_type', event_type, 'old_status', old_status,
    'new_status', new_status, 'created_at', created_at
  ) order by created_at), '[]'::jsonb) into events
    from public.order_events where order_id = o.id;
  return jsonb_build_object(
    'found', true,
    'order_number', o.order_number,
    'order_status', o.order_status,
    'payment_status', o.payment_status,
    'payment_method', o.payment_method,
    'total', o.total,
    'city', o.city,
    'created_at', o.created_at,
    'items', items,
    'events', events
  );
end $$;
grant execute on function public.track_order(text, text) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;
