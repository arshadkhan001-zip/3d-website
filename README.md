#  — precision phone covers & accessories

Cinematic React + Vite + TypeScript storefront (GSAP scroll film, Lenis) wired to
Supabase (Postgres + Auth + RLS + Edge Functions) for real COD commerce + admin.

## 1. Installation

```bash
npm install
npm run dev      # http://localhost:5173
```

## 2. Supabase project creation

1. Create a project at https://supabase.com/dashboard (free tier works).
2. Note the **Project URL** and **anon public key** (Settings → API).

## 3. Database migration

```bash
npm i -g supabase
supabase link --project-ref <your-project-ref>
supabase db push        # applies supabase/migrations/0001_schema.sql + 0002_rls.sql
```

Or paste the two migration files into the Dashboard SQL editor in order.

This creates: profiles, products, product_images, product_variants, coupons
(+ public `coupon_public` view), orders (`CKP-YYYY-XXXXXX` numbering),
order_items (price snapshots), payments, notifications, order_events,
store_settings, plus `reserve_stock` / `release_stock` / `track_order` RPCs.

## 4. Environment variables

```bash
cp .env.example .env
```

Fill `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`, then restart `npm run dev`.

Edge Function secrets (Dashboard → Edge Functions → Secrets, or CLI):

```bash
supabase secrets set RESEND_API_KEY=re_... ADMIN_EMAIL=vegetacoder69@gmail.com
supabase functions deploy place-order
supabase functions deploy order-notify
```

Never put service-role or Resend keys in `VITE_*` vars or frontend code.

## 5. Authentication setup

Dashboard → Authentication → Providers → enable **Email**.
(Optional) set Site URL to your production domain.

## 6. Admin setup (first admin)

1. Sign up at `/account` in the storefront.
2. In Dashboard → Table Editor → `profiles`, set your row's `role` to `admin`.
3. Open `/admin` — dashboard, orders, products, inventory, coupons,
   customers, notifications, settings.

RLS prevents privilege escalation: signups are forced to `customer`.

## 7. Email setup (Resend)

1. Create an account at https://resend.com, verify `coverkingpanipat.in`
   (or change the `from` address in both functions), create an API key.
2. `supabase secrets set RESEND_API_KEY=...`
3. New COD orders email the admin; status changes email the customer.
4. Without the key, emails are skipped + logged — never faked.

## 8. Product migration / seed

```bash
# in the SQL editor (or psql), run:
supabase/seed.sql
```

Seeds all 24 storefront products + variants + stock + placeholder visuals,
`FORM10` / `WELCOME15` coupons, and store settings. Re-runnable (upserts).
The storefront loads from Supabase when configured, else the local catalog.

## 9. Development

```bash
npm run dev     # frontend
```

## 10. Production deployment

```bash
npm run build   # → dist/
```

Deploy `dist/` to Vercel/Netlify/your host with the two `VITE_*` env vars set.
For client-side routes (`/product/*`, `/admin/*`), enable SPA fallback
(Vercel: rewrites to `/index.html`; Netlify: `_redirects` with `/* /index.html 200`).

## 11. COD testing

1. Add a cover → checkout → OTP (demo code on screen) → Pay.
2. Order `CKP-YYYY-XXXXXX` appears; stock drops.
3. `/admin/orders` → open → change status → customer notified.
4. Double-click Pay / refresh mid-order → same order (idempotency key), no duplicate.
5. Set a variant stock to 1, buy it twice in two sessions → second fails honestly.

## 12. Future online-payment integration

`CheckoutPage.PAYMENT_PROVIDERS` is the seam: `online` is disabled with
“Coming soon”. To connect Razorpay/Stripe: add a `create-online-payment`
Edge Function (order → gateway order, secret server-side), enable the
provider, verify webhooks in a `payment-webhook` function before marking
`paid`. Never trust frontend payment callbacks.

## Demo vs live

Without Supabase env vars the site runs in labeled demo mode (local catalog,
local orders, mock auth). Nothing is presented as a real database operation.
