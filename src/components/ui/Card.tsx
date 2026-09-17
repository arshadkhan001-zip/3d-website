import type { ReactNode } from "react";
import { cn } from "../../lib/utilities/utils";

interface Props {
  children: ReactNode;
  className?: string;
  theme?: "dark" | "light";
}

/**
 * Surface card. Radius 20, soft cinematic shadow, hairline border.
 * Never carries heavy blur — cheap to animate (transform/opacity only).
 */
export default function Card({ children, className, theme = "dark" }: Props) {
  return (
    <div
      className={cn(
        "rounded-[20px] p-6 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        theme === "dark"
          ? "bg-clay/80 border border-white/10 text-snow shadow-[0_24px_70px_-28px_rgba(0,0,0,0.65)]"
          : "bg-parchment border border-black/10 text-ink shadow-[0_24px_60px_-32px_rgba(16,20,28,0.28)]",
        className
      )}
    >
      {children}
    </div>
  );
}
