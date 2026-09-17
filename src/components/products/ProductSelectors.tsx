import { allowedModels, type PhoneModel } from "../../data/products";
import { cn } from "../../lib/utilities/utils";

/**
 * Phone-model selector (radio group, grouped by brand).
 * Combos excluded by the variant show disabled with text — never color-only.
 */
export function ModelSelector({
  productId,
  models,
  variantId,
  selected,
  onChange,
}: {
  productId: string;
  models: PhoneModel[];
  variantId: string;
  selected: string;
  onChange: (id: string) => void;
}) {
  const allowed = new Set(allowedModels(productId, variantId).map((m) => m.id));
  const brands = [...new Set(models.map((m) => m.brand))];

  return (
    <fieldset>
      <legend className="ds-annotation text-mist">Select your phone</legend>
      <div className="mt-4 space-y-5">
        {brands.map((brand) => {
          const brandModels = models.filter((m) => m.brand === brand);
          if (brandModels.length === 0) return null;
          return (
            <div key={brand}>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-mist/70">
                {brandModels[0].brandLabel}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {brandModels.map((m) => {
                  const disabled = !allowed.has(m.id);
                  const checked = selected === m.id;
                  return (
                    <label
                      key={m.id}
                      className={cn(
                        "inline-flex min-h-[44px] cursor-pointer items-center rounded-full border px-5 text-sm transition-colors duration-200",
                        disabled && "cursor-not-allowed opacity-35",
                        !disabled && checked && "border-snow bg-snow text-ink",
                        !disabled && !checked && "border-white/15 text-mist hover:border-white/40 hover:text-snow"
                      )}
                    >
                      <input
                        type="radio"
                        name="phone-model"
                        value={m.id}
                        checked={checked}
                        disabled={disabled}
                        onChange={() => onChange(m.id)}
                        className="sr-only"
                      />
                      {m.label}
                      {disabled && <span className="sr-only"> (unavailable)</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Color/variant selector. Selected state = ring + visible label text.
 */
export function VariantSelector({
  variants,
  selected,
  onChange,
}: {
  variants: { id: string; label: string; hex: string }[];
  selected: string;
  onChange: (id: string) => void;
}) {
  const current = variants.find((v) => v.id === selected) ?? variants[0];
  return (
    <fieldset>
      <legend className="ds-annotation text-mist">
        Choose colour — <span className="text-snow">{current.label}</span>
      </legend>
      <div className="mt-4 flex flex-wrap gap-3">
        {variants.map((v) => {
          const checked = selected === v.id;
          return (
            <label
              key={v.id}
              title={v.label}
              className={cn(
                "flex min-h-[48px] min-w-[48px] cursor-pointer items-center justify-center rounded-full border p-1.5 transition-all duration-200",
                checked
                  ? "border-ember"
                  : "border-white/15 hover:border-white/40"
              )}
            >
              <input
                type="radio"
                name="cover-variant"
                value={v.id}
                checked={checked}
                onChange={() => onChange(v.id)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[0.65rem] text-white"
                style={{ backgroundColor: v.hex }}
              >
                {checked && "✓"}
              </span>
              <span className="sr-only">{v.label}{checked ? " (selected)" : ""}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Quantity stepper. Never below 1; keyboard accessible natively. */
export function QuantitySelector({
  qty,
  onChange,
}: {
  qty: number;
  onChange: (qty: number) => void;
}) {
  const btn =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-lg text-snow transition-colors duration-200 hover:border-white/40 disabled:opacity-30";
  return (
    <div>
      <p id="qty-label" className="ds-annotation text-mist">
        Quantity
      </p>
      <div className="mt-4 flex items-center gap-4" role="group" aria-labelledby="qty-label">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={qty <= 1}
          onClick={() => onChange(qty - 1)}
          className={btn}
        >
          −
        </button>
        <output aria-live="polite" aria-label={`Quantity ${qty}`} className="min-w-8 text-center font-display text-lg tabular-nums text-snow">
          {qty}
        </output>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => onChange(qty + 1)}
          className={btn}
        >
          +
        </button>
      </div>
    </div>
  );
}
