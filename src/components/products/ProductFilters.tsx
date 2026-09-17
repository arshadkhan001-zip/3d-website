import { SHOP_FILTERS, type ShopFilter } from "../../data/products";
import { cn } from "../../lib/utilities/utils";

/**
 * Horizontally scrollable filter row. Functional — parent owns state.
 * Single-select pills, keyboard accessible via native buttons.
 */
export default function ProductFilters({
  active,
  onChange,
  counts,
}: {
  active: ShopFilter;
  onChange: (f: ShopFilter) => void;
  counts: Record<ShopFilter, number>;
}) {
  return (
    <div
      role="group"
      aria-label="Filter products"
      className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-wrap md:px-0"
    >
      {SHOP_FILTERS.map((f) => {
        const selected = active === f.id;
        return (
          <button
            key={f.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(f.id)}
            className={cn(
              "inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-5 text-sm transition-colors duration-200",
              selected
                ? "border-snow bg-snow text-ink"
                : "border-white/15 text-mist hover:border-white/35 hover:text-snow"
            )}
          >
            {f.label}
            <span
              aria-hidden="true"
              className={cn(
                "font-mono text-[0.65rem] tabular-nums",
                selected ? "text-ink/60" : "text-mist/60"
              )}
            >
              {counts[f.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
