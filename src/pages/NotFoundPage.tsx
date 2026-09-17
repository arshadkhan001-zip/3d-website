import { Link } from "react-router-dom";
import { useDocumentTitle } from "../lib/seo";

/** Polished 404 — never a blank screen. */
export default function NotFoundPage() {
  useDocumentTitle("Page not found", "This page doesn't exist — find your way back.");
  return (
    <section className="bg-base text-fg">
      <div className="ds-container ds-section pt-32 text-center">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-fgsoft">404</p>
        <h1 className="mx-auto mt-4 max-w-xl font-display text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-tight">
          Lost the plot.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-fgsoft">This page doesn&apos;t exist — but great protection does.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex min-h-[48px] items-center rounded-full bg-snow px-8 font-medium text-ink">Home</Link>
          <Link to="/shop" className="inline-flex min-h-[48px] items-center rounded-full border border-line px-8">Shop all</Link>
        </div>
      </div>
    </section>
  );
}
