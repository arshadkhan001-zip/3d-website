-- Cover King Panipat — core schema (Phase 3)
-- Run with: supabase db push  (or paste into the SQL editor in order)

-- ── helpers ──────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── profiles ─────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── products ─────────────────────────────────────────────
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  category text not null default 'Cases',
  series text not null default '',
  material text not null default '',
  tags text[] not null default '{}',
  brands text[] not null default '{}',
  badge text,
  phone_models text[] not null default '{}',
  rating numeric not null default 0,
  reviews_count integer not null default 0,
  sku text,
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_slug_idx on public.products (slug);
create index products_active_idx on public.products (active) where active;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort_order);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  phone_model text not null default '',
  color text not null default '',
  variant_models text[], -- null = fits all product models
  sku text,
  price integer check (price is null or price >= 0),
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_variants_product_idx on public.product_variants (product_id);
create trigger product_variants_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();

-- ── coupons ──────────────────────────────────────────────
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value integer not null check (discount_value >= 0),
  minimum_order integer not null default 0,
  maximum_discount integer,
  usage_limit integer,
  used_count integer not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Public-safe coupon preview (no usage counters).
create view public.coupon_public as
  select code, discount_type, discount_value, minimum_order, maximum_discount
  from public.coupons
  where active and (expires_at is null or expires_at > now());

-- ── orders ───────────────────────────────────────────────
create table public.order_counters (
  year integer primary key,
  last_number integer not null default 0
);

-- CKP-YYYY-XXXXXX, safe under concurrency (row lock).
create or replace function public.next_order_number()
returns text language plpgsql as $$
declare
  y integer := extract(year from now())::integer;
  n integer;
begin
  insert into public.order_counters (year, last_number)
    values (y, 0)
    on conflict (year) do nothing;
  update public.order_counters
    set last_number = last_number + 1
    where year = y
    returning last_number into n;
  return 'CKP-' || y || '-' || lpad(n::text, 6, '0');
end $$;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  email text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text not null default '',
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  subtotal integer not null,
  shipping_fee integer not null,
  discount integer not null default 0,
  total integer not null,
  coupon_code text,
  payment_method text not null default 'cod',
  payment_status text not null default 'pending'
    check (payment_status in ('pending','cod_pending','cod_collected','paid','failed','refunded')),
  order_status text not null default 'pending'
    check (order_status in ('pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','returned')),
  customer_notes text not null default '',
  admin_notes text not null default '',
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_number_idx on public.orders (order_number);
create index orders_status_idx on public.orders (order_status, created_at desc);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text not null default '',
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price integer not null,
  total_price integer not null
);
create index order_items_order_idx on public.order_items (order_id);

-- ── payments ─────────────────────────────────────────────
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'cod',
  provider_order_id text,
  provider_payment_id text,
  amount integer not null,
  currency text not null default 'INR',
  status text not null default 'pending'
    check (status in ('pending','cod_pending','cod_collected','paid','failed','refunded')),
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_idx on public.payments (order_id);
create trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

-- ── notifications / events / settings ────────────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (read, created_at desc) where not read;

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null,
  old_status text,
  new_status text,
  note text not null default '',
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index order_events_order_idx on public.order_events (order_id, created_at);

create table public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'Cover King Panipat',
  store_email text not null default 'vegetacoder69@gmail.com',
  store_phone text not null default '',
  currency text not null default 'INR',
  shipping_fee integer not null default 79,
  free_shipping_threshold integer not null default 999,
  cod_enabled boolean not null default true,
  online_payments_enabled boolean not null default false,
  low_stock_threshold integer not null default 5,
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (1);
create trigger store_settings_updated_at before update on public.store_settings
  for each row execute function public.set_updated_at();

-- ── safe stock movement (called from Edge Function w/ service role) ──
create or replace function public.reserve_stock(p_variant_id uuid, p_qty integer)
returns boolean language plpgsql as $$
declare
  updated integer;
begin
  update public.product_variants
    set stock = stock - p_qty, updated_at = now()
    where id = p_variant_id and stock >= p_qty;
  get diagnostics updated = row_count;
  return updated = 1;
end $$;

create or replace function public.release_stock(p_variant_id uuid, p_qty integer)
returns void language plpgsql as $$
begin
  update public.product_variants
    set stock = stock + p_qty, updated_at = now()
    where id = p_variant_id;
end $$;
