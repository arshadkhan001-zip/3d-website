import type { ReactNode } from "react";
import { cn } from "../../lib/utilities/utils";
import type { SectionTheme } from "../../lib/design/tokens";
import { SECTION_THEMES } from "../../lib/design/tokens";

/**
 * Section shell enforcing the dark/light narrative.
 * Later stages wrap every website section in this — never raw <section> with ad-hoc colors.
 */
export function Section({
  theme = "abyss",
  children,
  className,
  label,
}: {
  theme?: SectionTheme;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const t = SECTION_THEMES[theme];
  const light = theme === "bone" || theme === "parchment";
  return (
    <section
      aria-label={label}
      className={cn("ds-section", className)}
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      <div className="ds-container">{children}</div>
      <span className="sr-only">{light ? "Light section" : "Dark section"}</span>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "left",
  theme = "abyss",
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  align?: "left" | "center";
  theme?: SectionTheme;
}) {
  const light = theme === "bone" || theme === "parchment";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className={cn("ds-annotation", light ? "text-inksoft" : "text-mist")}>
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-[clamp(1.5rem,3vw,2.25rem)] font-medium leading-tight tracking-tight">
        {title}
      </h2>
      {copy && (
        <p className={cn("mt-4 text-[1.05rem] leading-relaxed", light ? "text-inksoft" : "text-mist")}>
          {copy}
        </p>
      )}
    </div>
  );
}
