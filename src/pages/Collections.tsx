import { Link, useParams } from "react-router-dom";
import ShopProductCard from "../components/products/ShopProductCard";
import { useDocumentTitle } from "../lib/seo";
import { COLLECTIONS, collectionById } from "../data/site";
import { useProducts } from "../lib/store/useCatalog";

/** All collections index. */
export function CollectionsPage() {
  useDocumentTitle("Collections", "Shop by mood — new drops, best sellers, MagSafe, rugged and more.");
  const { products } = useProducts();
  return (
    <section aria-label="Collections" className="bg-base text-fg">
      <div className="ds-container ds-section pt-28 md:pt-36">
        <p className="ds-annotation text-fgsoft">Collections</p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4rem)] font-medium tracking-tight">
          Shop by mood.
        </h1>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c) => {
            const n = products.filter(c.match).length;
            return (
              <Link
                key={c.id}
                to={`/collection/${c.id}`}
                className="group overflow-hidden border border-line transition-colors hover:border-fg"
              >
                <span
                  aria-hidden="true"
                  className="block aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.03]"
                  style={{ background: `linear-gradient(140deg, ${c.finish[0]}, ${c.finish[1]})` }}
                />
                <span className="block bg-raised px-5 py-4">
                  <span className="block font-display text-lg">{c.name}</span>
                  <span className="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-fgsoft">
                    {n} products →
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Single collection with its products. */
export function CollectionDetail() {
  const { id = "" } = useParams();
  const collection = collectionById(id);
  const { products, loading } = useProducts();
  useDocumentTitle(collection?.name ?? "Collection", collection?.blurb);

  if (!collection) {
    return (
      <section className="bg-base text-fg">
        <div className="ds-container ds-section pt-32 text-center">
          <h1 className="font-display text-4xl">Collection not found.</h1>
          <Link to="/collections" className="mt-6 inline-block underline underline-offset-4">
            All collections
          </Link>
        </div>
      </section>
    );
  }

  const items = products.filter(collection.match);
  if (loading && items.length === 0) {
    return (
      <section className="bg-base text-fg">
        <div className="ds-container ds-section pt-32 text-center text-fgsoft">
          Loading collection…
        </div>
      </section>
    );
  }
  return (
    <section aria-label={collection.name} className="bg-base text-fg">
      <div className="ds-container ds-section pt-28 md:pt-36">
        <p className="ds-annotation text-fgsoft">Collection</p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4rem)] font-medium tracking-tight">
          {collection.name}.
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-fgsoft">{collection.blurb}</p>
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
