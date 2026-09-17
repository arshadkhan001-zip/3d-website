import { Link } from "react-router-dom";
import { useDocumentTitle } from "../lib/seo";

/** Brand story + support + policies (anchor targets for footer links). */
export default function AboutPage() {
  useDocumentTitle("About", "The Cover King Panipat studio, support, shipping, returns and policies.");

  const block = (id: string, kicker: string, title: string, body: string[]) => (
    <section key={id} id={id} aria-label={title} className="scroll-mt-24 border-t border-line py-12 first:border-t-0 first:pt-0">
      <p className="ds-annotation text-fgsoft">{kicker}</p>
      <h2 className="mt-3 font-display text-3xl font-medium tracking-tight">{title}</h2>
      {body.map((p, i) => (
        <p key={i} className="mt-4 max-w-2xl leading-relaxed text-fgsoft">{p}</p>
      ))}
    </section>
  );

  return (
    <div className="bg-base text-fg">
      <div className="ds-container ds-section pt-28 md:pt-36">
        <p className="ds-annotation text-fgsoft">The studio</p>
        <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.04] tracking-tight">
          Covers, considered down to the last millimetre.
        </h1>
        <p className="mt-5 max-w-xl leading-relaxed text-fgsoft">
          Cover King Panipat crafts precision phone covers and accessories —
          one form language, honest materials, nothing decorative.
        </p>

        <div className="mt-14">
          {block("story", "Story", "Why we exist", [
            "Phones are the most-handled objects we own, yet most covers are afterthoughts. We design protection the way product designers design the phone itself — fit first, material second, decoration never.",
          ])}
          {block("journal", "Journal", "Studio notes", [
            "Drop-test diaries, material studies and behind-the-scenes looks at upcoming forms. New notes land with every collection drop.",
          ])}
          {block("shipping", "Support", "Shipping", [
            "Orders ship across India in 3–5 business days (standard) or 1–2 days (express). Shipping is free over ₹999, otherwise a flat ₹79. Every parcel is tracked door-to-door.",
          ])}
          {block("returns", "Support", "Returns & refunds", [
            "Changed your mind? Return unused products within 7 days for a full refund — no questions, no restocking fees. Refunds land in 5–7 business days to the original payment method.",
          ])}
          {block("contact", "Support", "Contact", [
            "Write to vegetacoder69@gmail.com and a human replies within one business day. For order issues, include your order ID (looks like CKP-2026-000123).",
          ])}
          {block("privacy", "Legal", "Privacy", [
            "This demo store keeps your bag, wishlist and account in your own browser (localStorage). Nothing leaves your device. A production store would publish its full data policy here.",
          ])}
          {block("terms", "Legal", "Terms", [
            "All products, prices and policies on this page are demonstration content. Nothing here constitutes a binding offer until real store terms are published.",
          ])}
        </div>

        <div className="mt-10">
          <Link to="/shop" className="inline-flex min-h-[48px] items-center rounded-full bg-snow px-8 font-medium text-ink">
            Shop the collection
          </Link>
        </div>
      </div>
    </div>
  );
}
