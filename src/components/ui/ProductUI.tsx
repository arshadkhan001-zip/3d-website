import { cn } from "../../lib/utilities/utils";

/**
 * Product-UI primitives — styling only, no data, no cart logic.
 * Real product data arrives in Stage 7. These samples use abstract values.
 */

export function Price({ value, compareAt, theme = "dark" }: { value: string; compareAt?: string; theme?: "dark" | "light" }) {
  return (
    <p className="flex items-baseline gap-2">
      <span className={cn("font-display text-lg font-medium tabular-nums", theme === "light" ? "text-ink" : "text-snow")}>
        {value}
      </span>
      {compareAt && (
        <s className={cn("text-sm tabular-nums", theme === "light" ? "text-inksoft" : "text-mist")}>
          {compareAt}
        </s>
      )}
    </p>
  );
}

export function Swatch({
  color,
  active,
  label,
}: {
  color: string;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={!!active}
      title={label}
      className={cn(
        "h-7 w-7 rounded-full border border-white/20 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 min-h-0 min-w-0",
        active && "ring-2 ring-ember ring-offset-2 ring-offset-abyss"
      )}
      style={{ backgroundColor: color }}
    />
  );
}

export function Stars({ value = 4.5 }: { value?: number }) {
  return (
    <p aria-label={`Rated ${value} out of 5`} className="flex gap-0.5 text-steel">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < Math.round(value) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.5l-5.9 3.2 1.3-6.6L2.5 9.5l6.6-.8L12 2.5z" />
        </svg>
      ))}
    </p>
  );
}

/** Nav link style contract for the future navbar (Stage 10). */
export function NavLinkStyle({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full px-4 py-2 text-sm text-mist transition-colors duration-200 hover:bg-white/5 hover:text-snow min-h-[44px] inline-flex items-center">
      {children}
    </span>
  );
}
