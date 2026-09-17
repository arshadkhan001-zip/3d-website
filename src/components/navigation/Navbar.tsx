import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X } from "lucide-react";
import { cn } from "../../lib/utilities/utils";
import { useCart } from "../../lib/cart/cart";
import { useWishlist } from "../../lib/wishlist/wishlist";
import { useTheme } from "../../lib/theme/theme";

const LINKS = [
  { label: "Shop", to: "/shop" },
  { label: "Collections", to: "/collections" },
  { label: "Accessories", to: "/collection/accessories" },
  { label: "New", to: "/collection/new" },
  { label: "About", to: "/about" },
];

const iconBtn =
  "relative inline-flex h-11 w-11 items-center justify-center rounded-full text-mist transition-colors duration-200 hover:bg-white/5 hover:text-snow";

function CountBadge({ n, label }: { n: number; label: string }) {
  if (n <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 font-mono text-[0.6rem] text-white"
    >
      {n > 99 ? "99+" : n}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Sticky cinematic header: transparent over the hero, blurred on scroll. */
export default function Navbar({ onSearch }: { onSearch: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, setCartOpen } = useCart();
  const { ids } = useWishlist();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const onHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open || !onHome
          ? "border-b border-white/10 bg-abyss/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="ds-container flex h-16 items-center justify-between gap-2">
        {/* Mobile: menu + logo + search + cart */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(iconBtn, "md:hidden")}
        >
          {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>

        <Link to="/" aria-label="Cover King Panipat — home" className="font-display text-lg tracking-tight text-snow">
          Cover King<span className="text-ember">.</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-sm text-mist transition-colors duration-200 hover:bg-white/5 hover:text-snow"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center">
          <button type="button" aria-label="Search" onClick={onSearch} className={iconBtn}>
            <Search size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <Link to="/account" aria-label="Account" className={cn(iconBtn, "hidden sm:inline-flex")}>
            <User size={18} strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <Link
            to="/wishlist"
            aria-label={ids.length > 0 ? `Wishlist, ${ids.length} items` : "Wishlist"}
            className={cn(iconBtn, "hidden sm:inline-flex")}
          >
            <Heart size={18} strokeWidth={1.75} aria-hidden="true" />
            <CountBadge n={ids.length} label="wishlisted" />
          </Link>
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={toggle}
            className={cn(iconBtn, "hidden sm:inline-flex")}
          >
            {theme === "dark" ? (
              <Sun size={18} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Moon size={18} strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            aria-label={count > 0 ? `Cart, ${count} items` : "Cart, empty"}
            onClick={() => setCartOpen(true)}
            className={iconBtn}
          >
            <ShoppingBag size={18} strokeWidth={1.75} aria-hidden="true" />
            <CountBadge n={count} label="in cart" />
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-t border-white/10 bg-abyss/95 backdrop-blur-xl md:hidden">
          <div className="ds-container flex flex-col py-2">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="inline-flex min-h-[48px] items-center border-b border-white/5 py-3 text-base text-snow last:border-0"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 py-3">
              <Link to="/account" className="inline-flex min-h-[48px] flex-1 items-center gap-2 text-base text-snow">
                <User size={18} aria-hidden="true" /> Account
              </Link>
              <Link to="/wishlist" className="inline-flex min-h-[48px] flex-1 items-center gap-2 text-base text-snow">
                <Heart size={18} aria-hidden="true" /> Wishlist ({ids.length})
              </Link>
              <button
                type="button"
                onClick={toggle}
                aria-label="Toggle theme"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-snow"
              >
                {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
