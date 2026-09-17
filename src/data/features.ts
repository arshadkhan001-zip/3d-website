/**
 * "Why our covers" feature content.
 * Plain statements only — no invented specs. Replace copy here when
 * real product information arrives.
 */
export interface CoverFeature {
  index: string;
  title: string;
  copy: string;
}

export const WHY_HEADLINE = {
  eyebrow: "Engineered for the everyday",
  titleA: "Protection,",
  titleB: "considered.",
  sub: "Every detail has a purpose — from the raised edges to the precision camera protection.",
} as const;

export const COVER_FEATURES: CoverFeature[] = [
  {
    index: "01",
    title: "Edge protection",
    copy: "Raised edges help protect the display from everyday contact.",
  },
  {
    index: "02",
    title: "Precision fit",
    copy: "Designed around the phone, with accurate buttons, ports and cutouts.",
  },
  {
    index: "03",
    title: "Camera guard",
    copy: "An elevated camera surround helps keep the lenses away from flat surfaces.",
  },
  {
    index: "04",
    title: "Slim profile",
    copy: "Protection without turning the phone into a bulky object.",
  },
];
