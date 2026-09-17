/**
 * STAGE 2 — Design tokens. Single source of truth.
 * Identity: "technical atelier" — hairline annotation lines, grid floor,
 * warm bone light sections. Complements the 239 dark-studio frames
 * (near-black navy bg, slate product, white callout lines) without competing.
 * Original system — not Apple/Nike/Shopify.
 */

export const COLORS = {
  // Dark story (matches frames)
  abyss: "#05070D", // page base, = frame backdrop
  stage: "#0A1220", // raised dark surface
  clay: "#131C2E", // dark card surface
  lineDark: "rgba(255,255,255,0.10)", // hairlines on dark
  // Light story (warm, not Apple gray)
  bone: "#ECE7DB", // light section base
  parchment: "#F4F1E8", // light raised
  ink: "#10141C", // text on light
  inkSoft: "#4A5261", // secondary on light
  lineLight: "rgba(16,20,28,0.12)",
  // Product-true neutrals (sampled from frames)
  slate: "#7E93B0", // case side tone
  mist: "#93A0B4", // secondary text on dark
  snow: "#F4F1E8", // primary text on dark (warm white)
  // Accent — ember copper, used sparingly (CTA + focus + active only)
  ember: "#E0762E",
  emberDeep: "#B85A1E",
  steel: "#9DB9DD", // quiet info/glow, never neon
  success: "#4A9B7F",
  warning: "#C98A2E",
  danger: "#C44A3A",
} as const;

/** Dark → light narrative. Sections never alternate randomly. */
export const SECTION_THEMES = {
  abyss: { bg: COLORS.abyss, fg: COLORS.snow, sub: COLORS.mist, line: COLORS.lineDark },
  stage: { bg: COLORS.stage, fg: COLORS.snow, sub: COLORS.mist, line: COLORS.lineDark },
  bone: { bg: COLORS.bone, fg: COLORS.ink, sub: COLORS.inkSoft, line: COLORS.lineLight },
  parchment: { bg: COLORS.parchment, fg: COLORS.ink, sub: COLORS.inkSoft, line: COLORS.lineLight },
} as const;

export type SectionTheme = keyof typeof SECTION_THEMES;

/** Intended page narrative for later stages (Stage 2 defines, later stages apply). */
export const PAGE_NARRATIVE: SectionTheme[] = [
  "abyss", // hero (frames)
  "stage", // reveal + product
  "bone", // materials — the light break
  "parchment", // collections
  "stage", // reviews
  "abyss", // CTA + footer
];

export const TYPE = {
  displayXl: "clamp(2.75rem, 7vw, 5.5rem)",
  h1: "clamp(2rem, 4.5vw, 3.25rem)",
  h2: "clamp(1.5rem, 3vw, 2.25rem)",
  h3: "1.25rem",
  lead: "1.125rem",
  body: "1rem",
  caption: "0.75rem",
} as const;

export const SPACING = {
  sectionY: { mobile: 96, desktop: 144 },
  containerMax: 1200,
  gutter: 24,
  stackSm: 16,
  stackMd: 32,
  stackLg: 64,
} as const;

export const RADII = {
  pill: 999,
  card: 20,
  cardSm: 14,
  swatch: 999,
} as const;

export const SHADOWS = {
  cardDark: "0 24px 70px -28px rgba(0,0,0,0.65)",
  cardLight: "0 24px 60px -32px rgba(16,20,28,0.28)",
  pop: "0 12px 32px -12px rgba(0,0,0,0.5)",
} as const;

export const EASING = {
  outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  outEase: "cubic-bezier(0.22, 1, 0.36, 1)",
  durFast: 180,
  durBase: 320,
  durSlow: 600,
} as const;

export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;

/** Contrast pairs verified for AA (body) / AA-large (accent). */
export const CONTRAST_RULES = [
  "Body on dark: snow #F4F1E8 on abyss — ~15:1 — body/AA pass",
  "Secondary on dark: mist #93A0B4 on abyss — ~7:1 — AA pass",
  "Body on light: ink #10141C on bone — ~14:1 — AA pass",
  "Ember #E0762E on abyss — large/bold + UI accents only, never small body text",
  "Focus ring always ember 2px + 3px offset — visible on both themes",
] as const;
