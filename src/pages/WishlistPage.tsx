import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import ShopProductCard from "../components/products/ShopProductCard";
import { useDocumentTitle } from "../lib/seo";
import { useWishlist } from "../lib/wishlist/wishlist";
import { useProducts } from "../lib/store/useCatalog";

/** Saved items with move-to-bag. */
export default function WishlistPage() {
  useDocumentTitle("Wishlist", "Your saved covers and accessories.");
  const { ids, toggle } = useWishlist();
  const { products } = useProducts();
  const items = products.filter((p) => ids.includes(p.id));

  return (
    <section aria-label="Wishlist" className="bg-base text-fg">
      <div className="ds-container ds-section pt-28 md:pt-36">
        <p className="ds-annotation text-fgsoft">Saved</p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4rem)] font-medium tracking-tight">
          Wishlist.
        </h1>
        {items.length === 0 ? (
          <div className="mt-12 border border-line px-6 py-20 text-center">
            <Heart size={28} aria-hidden="true" className="mx-auto text-fgsoft" />
            <p className="mt-4 font-display text-2xl">Nothing saved yet.</p>
            <p className="mt-2 text-sm text-fgsoft">Tap the heart on any product to keep it here.</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-snow px-8 font-medium text-ink"
            >
              Discover products
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-4 text-fgsoft">{items.length} saved {items.length === 1 ? "item" : "items"}</p>
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <div key={p.id} className="relative">
                  <ShopProductCard product={p} />
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    className="mt-3 inline-flex min-h-[44px] items-center text-sm text-fgsoft underline underline-offset-4 hover:text-fg"
                  >
                    Remove from wishlist
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
