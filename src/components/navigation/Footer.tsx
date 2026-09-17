import { Link } from "react-router-dom";
import { Instagram, Youtube, Facebook } from "lucide-react";
import Newsletter from "../sections/Newsletter";

const COLS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All covers", to: "/shop" },
      { label: "New arrivals", to: "/collection/new" },
      { label: "Best sellers", to: "/collection/best-sellers" },
      { label: "Accessories", to: "/collection/accessories" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track order", to: "/track" },
      { label: "Shipping", to: "/about#shipping" },
      { label: "Returns", to: "/about#returns" },
      { label: "Contact", to: "/about#contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Journal", to: "/about#journal" },
      { label: "Wishlist", to: "/wishlist" },
      { label: "Account", to: "/account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/about#privacy" },
      { label: "Terms", to: "/about#terms" },
      { label: "Refunds", to: "/about#returns" },
    ],
  },
];

/** Comprehensive footer: link columns, newsletter, socials, payments. */
export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-abyss">
      <div className="ds-container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="font-display text-2xl tracking-tight text-snow">
              Cover King<span className="text-ember">.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-mist">
              Precision covers and accessories, engineered for the everyday.
            </p>
            <div className="mt-6 flex gap-2">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "YouTube" },
                { icon: Facebook, label: "Facebook" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#social"
                  aria-label={label}
                  onClick={(e) => e.preventDefault()}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-mist transition-colors hover:border-white/40 hover:text-snow"
                >
                  <Icon size={17} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLS.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-mist">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-1">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="inline-flex min-h-[36px] items-center text-sm text-mist transition-colors hover:text-snow"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-10">
          <Newsletter compact />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist">
            © 2026 Cover King Panipat · Panipat, Haryana
          </p>
          <ul aria-label="Accepted payments" className="flex flex-wrap gap-2">
            {["UPI", "Visa", "MC", "RuPay", "COD"].map((p) => (
              <li
                key={p}
                className="rounded border border-white/15 px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.12em] text-mist"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
