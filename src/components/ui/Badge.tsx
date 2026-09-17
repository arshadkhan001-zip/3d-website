import { cn } from "../../lib/utilities/utils";

/** Mono uppercase micro-label. Echoes frame callouts. */
export default function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "light";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.2em]",
        tone === "neutral" && "border-white/15 text-mist",
        tone === "accent" && "border-ember/50 text-ember",
        tone === "light" && "border-black/15 text-inksoft",
        className
      )}
    >
      {children}
    </span>
  );
}
