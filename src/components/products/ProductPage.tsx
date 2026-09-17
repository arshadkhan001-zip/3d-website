import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { gsap, ScrollTrigger } from "../../lib/animations/gsap";
import { isReducedMotion } from "../../lib/utilities/utils";
import Button from "../ui/Button";
import { Stars } from "../ui/ProductUI";
import ProductGallery from "./ProductGallery";
import { ModelSelector, QuantitySelector, VariantSelector } from "./ProductSelectors";
import {
  ProductReviews,
  RecentlyViewed,
  RelatedProducts,
  StickyBuyBar,
  recordView,
} from "./PdpExtras";
import { useCart } from "../../lib/cart/cart";
import { useWishlist } from "../../lib/wishlist/wishlist";
import {
  AVAILABILITY_LABEL,
  PHONE_MODELS,
  STORE_INFO,
  formatPrice,
  ratingFor,
  specsFor,
} from "../../data/products";
import { useProduct } from "../../lib/store/useCatalog";
import { checkStock } from "../../lib/store/catalog";
import { storeAllowedModels, storeModelsFor } from "../../lib/store/orders";
import { cn } from "../../lib/utilities/utils";

/**
 * Product detail route (/product/:slug). Editorial layout in brand language:
 * large gallery left, configuration right, spec rows below.
 * Frontend-only cart/wishlist; no checkout/backend in this stage.
 */
export default function ProductPage() {
  const { slug = "" } = useParams();
  const { product, loading } = useProduct(slug);
  const { add, notify } = useCart();
  const { has, toggle } = useWishlist();

  const models = useMemo(() => (product ? storeModelsFor(product) : []), [product]);
  const [modelId, setModelId] = useState(() => models[0]?.id ?? "");
  const [variantId, setVariantId] = useState(() => product?.variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const scope = useRef<HTMLDivElement>(null);

  // Keep selection valid when the variant limits the model list.
  const allowed = product ? storeAllowedModels(product, variantId) : [];
  useEffect(() => {
    if (!product) return;
    if (!allowed.some((m) => m.id === modelId) && allowed.length > 0) {
      setModelId(allowed[0].id);
    }
  }, [product, variantId, modelId, allowed]);

  // Recently-viewed history (excludes current page when rendered).
  useEffect(() => {
    if (slug) recordView(slug);
  }, [slug]);

  // Entry reveal (staggered, transform/opacity only).
  useLayoutEffect(() => {    if (!scope.current || isReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-pdp-visual]", { opacity: 0, y: 32, duration: 0.9, ease: "power3.out" });
      gsap.from("[data-pdp-info] > *", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.06,
        delay: 0.1,
      });
    }, scope);
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => {
      window.clearTimeout(t);
      ctx.revert();
    };
  }, [slug]);

  if (!product) {
    return (
      <div className="ds-container py-32 text-center">
        <p className="ds-annotation text-mist">Not found</p>
        <h1 className="mt-4 font-display text-4xl text-snow">This cover doesn&apos;t exist.</h1>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-snow px-7 font-medium text-ink"
        >
          Back home →
        </Link>
      </div>
    );
  }

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const modelLabel =
    PHONE_MODELS.find((m) => m.id === modelId)?.label ?? "Universal fit";
  const universal = models.length === 0;
  const rating = ratingFor(product.id);
  const specs = specsFor(product);
  const wished = has(product.id);

  const handleAdd = async () => {
    if (!product) return;
    const stock = await checkStock(product.id, variant.id, qty);
    if (!stock.ok) {
      notify(`Only ${stock.available} left — lower the quantity.`, "error");
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      series: product.series,
      modelId,
      modelLabel,
      variantId: variant.id,
      variantLabel: variant.label,
      hex: variant.hex,
      price: product.price,
      qty,
      finish: product.finish,
    });
  };

  if (loading && !product) {
    return (
      <div className="ds-container pb-24 pt-28 md:pt-36" aria-busy="true" aria-label="Loading product">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse bg-stage" />
          <div className="space-y-4">
            <div className="h-4 w-32 animate-pulse bg-stage" />
            <div className="h-12 w-3/4 animate-pulse bg-stage" />
            <div className="h-4 w-1/2 animate-pulse bg-stage" />
            <div className="h-12 w-full animate-pulse rounded-full bg-stage" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={scope} className="ds-container pb-36 pt-28 md:pb-24 md:pt-36">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mist">
        <Link to="/" className="transition-colors hover:text-snow">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-snow">
          {product.name}
        </span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Gallery */}
        <div data-pdp-visual className="self-start lg:sticky lg:top-24">
          <ProductGallery product={product} />
        </div>

        {/* Info — mobile order matches spec via natural DOM order */}
        <div data-pdp-info>
          <p className="ds-annotation text-mist">
            Cover King — {product.series}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,4.5vw,3.5rem)] font-medium leading-[1.02] tracking-tight text-snow">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <Stars value={rating.rating} />
            <span className="text-sm tabular-nums text-mist">
              {rating.rating.toFixed(1)} · {rating.reviews} reviews
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <p className="font-display text-2xl font-medium tabular-nums text-snow">
              {formatPrice(product.price)}
            </p>
            {product.compareAt && (
              <s className="text-base tabular-nums text-mist">
                {formatPrice(product.compareAt)}
              </s>
            )}
            <p className="ml-auto font-mono text-[0.65rem] uppercase tracking-[0.18em] text-mist">
              {AVAILABILITY_LABEL[product.availability]}
            </p>
          </div>

          <p className="mt-5 leading-relaxed text-mist">{product.description}</p>

          <div className="mt-8 border-t border-white/10 pt-8">
            {universal ? (
              <div>
                <p className="ds-annotation text-mist">Fit</p>
                <p className="mt-3 text-snow">Universal fit — no device selection needed.</p>
              </div>
            ) : (
              <ModelSelector
                productId={product.id}
                models={models}
                variantId={variant.id}
                selected={modelId}
                onChange={setModelId}
              />
            )}
          </div>

          <div className="mt-8">
            <VariantSelector
              variants={product.variants}
              selected={variant.id}
              onChange={setVariantId}
            />
          </div>

          <div className="mt-8">
            <QuantitySelector qty={qty} onChange={setQty} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1" onClick={handleAdd}>
              Add to cart — {formatPrice(product.price * qty)}
            </Button>
            <button
              type="button"
              onClick={() => toggle(product.id)}
              aria-pressed={wished}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border px-6 text-sm transition-colors duration-200",
                wished
                  ? "border-ember/60 text-ember"
                  : "border-white/15 text-mist hover:border-white/40 hover:text-snow"
              )}
            >
              <Heart size={17} strokeWidth={1.75} aria-hidden="true" fill={wished ? "currentColor" : "none"} />
              {wished ? "Wishlisted" : "Wishlist"}
            </button>
          </div>

          {/* Store assurances (placeholder policy UI — see data flag) */}
          <ul className="mt-8 grid grid-cols-3 gap-2 border-y border-white/10 py-5">
            {[STORE_INFO.shipping, STORE_INFO.returns, STORE_INFO.checkout].map((s) => (
              <li key={s} className="text-center font-mono text-[0.62rem] uppercase leading-relaxed tracking-[0.14em] text-mist">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Details */}
      <div className="mt-20 border-t border-white/10 pt-12 md:mt-28">
        <p className="ds-annotation text-mist">The details</p>
        <dl className="mt-8 grid gap-x-16 md:grid-cols-2">
          {specs.map((s) => (
            <div key={s.label} className="flex items-baseline justify-between gap-6 border-b border-white/10 py-4">
              <dt className="shrink-0 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mist">
                {s.label}
              </dt>
              <dd className="text-right text-snow">{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-mist/60">
          Demo specifications — replace with verified product data
        </p>
      </div>

      <ProductReviews product={product} />
      <RelatedProducts product={product} />
      <RecentlyViewed currentSlug={product.slug} />

      <StickyBuyBar
        product={product}
        modelLabel={modelLabel}
        variantLabel={variant.label}
        price={product.price * qty}
        onAdd={handleAdd}
      />
    </div>
  );
}
