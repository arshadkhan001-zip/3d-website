import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../lib/seo";
import { getOrders } from "../lib/orders";
import { paymentStatusLabel } from "../lib/orders";
import { isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { myOrdersRemote, type MyOrder } from "../lib/store/orders";
import { formatPrice } from "../data/products";
import { useWishlist } from "../lib/wishlist/wishlist";
import { cn } from "../lib/utilities/utils";

const ACCOUNT_KEY = "form-account-v1";

function loadAccount(): { name: string; email: string } | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const inputCls =
  "h-12 w-full rounded-[12px] border border-line bg-transparent px-4 text-sm text-fg placeholder:text-fgsoft/70 focus:border-fg focus:outline-none";

/** Account: Supabase auth + DB orders when configured, demo profile otherwise. */
export default function AccountPage() {
  useDocumentTitle("Account", "Sign in, orders, addresses and settings.");
  const cloud = isSupabaseConfigured();
  if (cloud) return <CloudAccount />;
  return <DemoAccount />;
}

/* ── cloud mode ─────────────────────────────────────────── */

function CloudAccount() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const { ids } = useWishlist();

  useEffect(() => {
    if (!user) return;
    myOrdersRemote().then(setOrders).catch(() => setOrders([]));
  }, [user]);

  if (loading) {
    return (
      <section className="bg-base text-fg">
        <div className="ds-container ds-section pt-32 text-center text-fgsoft">Loading account…</div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="bg-base text-fg">
        <div className="ds-container ds-section mx-auto max-w-md pt-28 md:pt-36">
          <p className="ds-annotation text-fgsoft">Account</p>
          <h1 className="mt-4 font-display text-4xl font-medium tracking-tight">Welcome back.</h1>
          <div role="tablist" aria-label="Sign in or create account" className="mt-6 flex gap-2">
            {(["in", "up"] as const).map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setError(""); }}
                className={cn("min-h-[44px] rounded-full border px-6 text-sm", mode === m ? "border-fg" : "border-line text-fgsoft")}>
                {m === "in" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setBusy(true);
              const res = mode === "in"
                ? await signIn(email, password)
                : await signUp(name, email, password);
              setBusy(false);
              if (res.error) setError(res.error);
            }}
            className="mt-6 space-y-3"
          >
            {mode === "up" && (
              <div><label htmlFor="acc-name" className="sr-only">Full name</label><input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputCls} /></div>
            )}
            <div><label htmlFor="acc-email" className="sr-only">Email</label><input id="acc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputCls} /></div>
            <div><label htmlFor="acc-pass" className="sr-only">Password</label><input id="acc-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 characters)" minLength={6} className={inputCls} /></div>
            {error && <p role="alert" className="text-sm text-ember">{error}</p>}
            <button type="submit" disabled={busy} className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-snow font-medium text-ink disabled:opacity-60">
              {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-fgsoft">Guest checkout stays available — no account needed to order.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-base text-fg">
      <div className="ds-container ds-section pt-28 md:pt-36">
        <p className="ds-annotation text-fgsoft">Account{user.role === "admin" ? " · admin" : ""}</p>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium tracking-tight">
          Hi, {(user.fullName || user.email).split(" ")[0]}.
        </h1>
        <p className="mt-2 text-sm text-fgsoft">{user.email} · Wishlist: {ids.length} items</p>
        {user.role === "admin" && (
          <Link to="/admin" className="mt-4 inline-flex min-h-[44px] items-center rounded-full border border-ember/60 px-6 text-sm text-ember">
            Open admin dashboard →
          </Link>
        )}
        <h2 className="mt-10 font-display text-2xl">Order history</h2>
        {orders === null ? (
          <p className="mt-4 text-fgsoft">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="mt-4 text-fgsoft">No orders yet. <Link to="/shop" className="text-fg underline underline-offset-4">Start shopping</Link></p>
        ) : (
          <ul className="mt-4 max-w-2xl divide-y divide-[var(--t-line)] border-y border-line">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <Link to={`/order/${o.order_number}`} className="font-mono hover:underline">{o.order_number}</Link>
                  <p className="text-xs text-fgsoft">
                    {new Date(o.created_at).toLocaleDateString("en-IN")} · {o.items.length} items · {o.order_status.replace(/_/g, " ")} · {paymentStatusLabel(o.payment_status)}
                  </p>
                </div>
                <p className="tabular-nums">{formatPrice(o.total)}</p>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-8 inline-flex min-h-[48px] items-center rounded-full border border-line px-8 text-sm"
        >
          Sign out
        </button>
      </div>
    </section>
  );
}

/* ── demo mode (unchanged local behavior) ───────────────── */

function DemoAccount() {
  const [account, setAccount] = useState(loadAccount);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState<"orders" | "addresses" | "settings">("orders");
  const [addresses, setAddresses] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("form-addresses-v1") ?? "[]");
    } catch {
      return [];
    }
  });
  const [newAddr, setNewAddr] = useState("");
  const { ids } = useWishlist();
  const orders = getOrders();

  if (!account) {
    return (
      <section className="bg-base text-fg">
        <div className="ds-container ds-section mx-auto max-w-md pt-28 md:pt-36">
          <p className="ds-annotation text-fgsoft">Account</p>
          <h1 className="mt-4 font-display text-4xl font-medium tracking-tight">Welcome back.</h1>
          <p className="mt-3 text-sm text-fgsoft">Demo sign-in — any name and email works. No password needed yet.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
              const a = { name: name.trim(), email: email.trim() };
              try {
                localStorage.setItem(ACCOUNT_KEY, JSON.stringify(a));
              } catch {
                /* ignore */
              }
              setAccount(a);
            }}
            className="mt-8 space-y-3"
          >
            <div><label htmlFor="acc-name" className="sr-only">Name</label><input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputCls} /></div>
            <div><label htmlFor="acc-email" className="sr-only">Email</label><input id="acc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputCls} /></div>
            <button type="submit" className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-snow font-medium text-ink">
              Sign in
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-fgsoft">New here? Signing in creates your demo profile.</p>
        </div>
      </section>
    );
  }

  const tabs = [
    { id: "orders", label: `Orders (${orders.length})` },
    { id: "addresses", label: `Addresses (${addresses.length})` },
    { id: "settings", label: "Settings" },
  ] as const;

  return (
    <section className="bg-base text-fg">
      <div className="ds-container ds-section pt-28 md:pt-36">
        <p className="ds-annotation text-fgsoft">Account</p>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium tracking-tight">
          Hi, {account.name.split(" ")[0]}.
        </h1>

        <div role="tablist" aria-label="Account sections" className="mt-8 flex gap-2 border-b border-line">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "min-h-[48px] border-b-2 px-4 text-sm",
                tab === t.id ? "border-fg text-fg" : "border-transparent text-fgsoft"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8 max-w-2xl">
          {tab === "orders" && (
            orders.length === 0 ? (
              <p className="text-fgsoft">No orders yet. <Link to="/shop" className="text-fg underline underline-offset-4">Start shopping</Link></p>
            ) : (
              <ul className="divide-y divide-[var(--t-line)] border-y border-line">
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <Link to={`/order/${o.id}`} className="font-display hover:underline">{o.id}</Link>
                      <p className="text-xs text-fgsoft">{new Date(o.date).toLocaleDateString("en-IN")} · {o.items.length} items</p>
                    </div>
                    <p className="tabular-nums">{formatPrice(o.total)}</p>
                  </li>
                ))}
              </ul>
            )
          )}

          {tab === "addresses" && (
            <div>
              <ul className="space-y-2">
                {addresses.map((a, i) => (
                  <li key={i} className="border border-line px-4 py-3 text-sm">{a}</li>
                ))}
              </ul>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newAddr.trim().length < 6) return;
                  const next = [...addresses, newAddr.trim()];
                  setAddresses(next);
                  setNewAddr("");
                  try {
                    localStorage.setItem("form-addresses-v1", JSON.stringify(next));
                  } catch {
                    /* ignore */
                  }
                }}
                className="mt-4 flex gap-2"
              >
                <label htmlFor="new-addr" className="sr-only">New address</label>
                <input id="new-addr" value={newAddr} onChange={(e) => setNewAddr(e.target.value)} placeholder="Flat, street, city, PIN" className={inputCls} />
                <button type="submit" className="h-12 shrink-0 rounded-full bg-snow px-6 text-sm font-medium text-ink">Save</button>
              </form>
            </div>
          )}

          {tab === "settings" && (
            <div className="space-y-4">
              <p className="text-sm text-fgsoft">{account.email} · Wishlist: {ids.length} items</p>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem(ACCOUNT_KEY);
                  } catch {
                    /* ignore */
                  }
                  setAccount(null);
                }}
                className="inline-flex min-h-[48px] items-center rounded-full border border-line px-8 text-sm"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
