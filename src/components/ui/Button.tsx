import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utilities/utils";

type Variant = "primary" | "accent" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] select-none disabled:opacity-45 disabled:pointer-events-none min-h-[44px] cursor-pointer focus-visible:outline-2";

const variants: Record<Variant, string> = {
  // Quiet luxury: warm white on dark. Default CTA — lets frames stay the hero.
  primary:
    "bg-snow text-ink rounded-full hover:bg-white hover:-translate-y-px active:translate-y-0 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)]",
  // Ember copper — reserved for final conversion moments only.
  accent:
    "bg-ember text-white rounded-full hover:bg-emberdeep hover:-translate-y-px active:translate-y-0",
  // Hairline ghost — secondary actions on dark.
  ghost:
    "bg-transparent text-snow rounded-full border border-white/15 hover:border-white/35 hover:bg-white/5",
  link: "bg-transparent text-snow underline underline-offset-4 decoration-white/30 hover:decoration-white min-h-0 px-0",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm min-h-[40px]",
  md: "px-6 py-3 text-[0.95rem]",
  lg: "px-8 py-4 text-base",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: Props) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest} />
  );
}
