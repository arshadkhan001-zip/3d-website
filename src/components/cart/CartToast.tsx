import { useEffect } from "react";
import { useCart } from "../../lib/cart/cart";

/** Small "Added to bag" confirmation. Auto-dismisses, screen-reader live. */
export default function CartToast() {
  const { toast, clearToast } = useCart();

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(clearToast, 2600);
    return () => window.clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  const error = toast.kind === "error";

  return (
    <div
      role={error ? "alert" : "status"}
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2"
    >
      <p className="flex items-center gap-3 whitespace-nowrap rounded-full border border-white/15 bg-abyss/90 py-3 pl-4 pr-6 text-sm text-snow shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-ember text-[0.7rem] text-white">
          {error ? "!" : "✓"}
        </span>
        {toast.message}
      </p>
    </div>
  );
}
