import { Link, useLocation } from "react-router-dom";
import { Heart, Home, Search, ShoppingBag, LayoutGrid } from "lucide-react";
import { cn } from "../../lib/utilities/utils";
import { useCart } from "../../lib/cart/cart";
import { useWishlist } from "../../lib/wishlist/wishlist";

/** Sticky bottom navigation for touch devices. */
export default function MobileNav({ onSearch }: { onSearch: () => void }) {
  const { count, setCartOpen } = useCart();
  const { ids } = useWishlist();
  const { pathname } = useLocation();

  const link = (active: boolean) =>
    cn(
      "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[0.6rem] uppercase tracking-[0.12em]",
      active ? "text-snow" : "text-mist"
    );

  return (
    <nav
      aria-label="Mobile shop"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-abyss/90 backdrop-blur-xl md:hidden"
    >
      <div className="flex">
        <Link to="/" className={link(pathname === "/")}>
          <Home size={19} aria-hidden="true" /> Home
        </Link>
        <Link to="/shop" className={link(pathname.startsWith("/shop") || pathname.startsWith("/collection"))}>
          <LayoutGrid size={19} aria-hidden="true" /> Shop
        </Link>
        <button type="button" onClick={onSearch} aria-label="Search" className={link(false)}>
          <Search size={19} aria-hidden="true" /> Search
        </button>
        <Link to="/wishlist" className={link(pathname === "/wishlist")}>
          <span className="relative">
            <Heart size={19} aria-hidden="true" />
            {ids.length > 0 && (
              <span aria-hidden="true" className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 font-mono text-[0.55rem] text-white">
                {ids.length}
              </span>
            )}
          </span>
          Saved
        </Link>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label={count > 0 ? `Bag, ${count} items` : "Bag"}
          className={link(false)}
        >
          <span className="relative">
            <ShoppingBag size={19} aria-hidden="true" />
            {count > 0 && (
              <span aria-hidden="true" className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 font-mono text-[0.55rem] text-white">
                {count}
              </span>
            )}
          </span>
          Bag
        </button>
      </div>
    </nav>
  );
}
