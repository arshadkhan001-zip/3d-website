/**
 * STAGE 3 — Hero copy. Single place to replace headline/sub/CTAs later.
 * No generic "style meets protection" phrasing.
 */
export const HERO_COPY = {
  eyebrow: "Precision covers — a 239-frame study",
  headlineA: "Hard lines.",
  headlineB: "Soft landing.",
  sub: "A precision-moulded cover, drawn frame by frame. Exact cutouts, quiet grip, one considered form.",
  primaryCta: "Explore collection",
  secondaryCta: "Our construction",
  scrollHint: "Scroll",
  frameAlt:
    "First frame of the 239-frame product study — dark studio, wireframe origin of the precision cover",
} as const;

/**
 * STAGE 4.5 — Feature story. Large scrub-driven statements.
 * Placeholders only — swap text here when real product info arrives.
 * `window` = [visibleFrom, fadeOutStart] as timeline fractions.
 */
export interface FeatureStatement {
  id: string;
  kicker: string;
  lines: string[];
  align: "left" | "center" | "right";
  window: [number, number];
}

export const FEATURE_STATEMENTS: FeatureStatement[] = [
  { id: "edge", kicker: "01 — Edge", lines: ["EDGE", "PROTECTION"], align: "left", window: [0.15, 0.3] },
  { id: "fit", kicker: "02 — Fit", lines: ["PRECISION", "FIT"], align: "center", window: [0.3, 0.45] },
  { id: "lips", kicker: "03 — Lips", lines: ["RAISED", "LIPS"], align: "right", window: [0.45, 0.6] },
  { id: "camera", kicker: "04 — Camera", lines: ["CAMERA", "GUARD"], align: "left", window: [0.6, 0.75] },
  { id: "shock", kicker: "05 — Shock", lines: ["SHOCK", "ABSORPTION"], align: "center", window: [0.75, 0.88] },
  { id: "last", kicker: "06 — Endurance", lines: ["BUILT", "TO LAST"], align: "center", window: [0.88, 1] },
];

export const STORY_IN = 0.045;
export const STORY_OUT = 0.045;

export const FINAL_CTA = {
  label: "Explore the collection",
  inAt: 0.93,
} as const;
