import type { Product } from "./products";

/** Demo site content — replace with CMS/real data later. */

export interface Collection {
  id: string;
  name: string;
  blurb: string;
  finish: [string, string];
  match: (p: Product) => boolean;
}

const isNew = (p: Product) => p.badge === "New" || ["form-tempered", "form-magcharge", "form-grip"].includes(p.id);

export const COLLECTIONS: Collection[] = [
  {
    id: "new",
    name: "New Drops",
    blurb: "The latest forms, fresh off the bench.",
    finish: ["#E0762E", "#5E3D14"],
    match: (p) => isNew(p),
  },
  {
    id: "best-sellers",
    name: "Best Sellers",
    blurb: "The covers people reorder and gift.",
    finish: ["#C9D5E6", "#5E6E88"],
    match: (p) => p.badge === "Bestseller" || ["form-clear", "form-carbon", "form-power-10k"].includes(p.id),
  },
  {
    id: "clear",
    name: "Clear",
    blurb: "Nothing between you and the design.",
    finish: ["#DDE5F0", "#7E93B0"],
    match: (p) => p.tags.includes("transparent"),
  },
  {
    id: "magsafe",
    name: "MagSafe",
    blurb: "Snap-on charging, wallets and mounts.",
    finish: ["#8E97A6", "#232936"],
    match: (p) => (p.kind ?? "cases") === "magsafe" || p.compatibility.some((c) => c.includes("MagSafe")),
  },
  {
    id: "rugged",
    name: "Rugged",
    blurb: "Built for drops, dust and bad days.",
    finish: ["#3A3E46", "#121316"],
    match: (p) => p.tags.includes("protective"),
  },
  {
    id: "minimal",
    name: "Minimal",
    blurb: "Thin, quiet, pocketable.",
    finish: ["#E3E0D8", "#8E97A6"],
    match: (p) => p.tags.includes("minimal") && (p.kind ?? "cases") === "cases",
  },
  {
    id: "accessories",
    name: "Accessories",
    blurb: "Power, protection and mounts beyond the case.",
    finish: ["#2E4A6B", "#10141C"],
    match: (p) => (p.kind ?? "cases") !== "cases",
  },
  {
    id: "travel",
    name: "Travel",
    blurb: "Power and mounts for the road.",
    finish: ["#4A5261", "#141821"],
    match: (p) => ["power", "auto", "cables"].includes(p.kind ?? "cases"),
  },
];

export function collectionById(id: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.id === id);
}

export interface DeviceGroup {
  brand: string;
  label: string;
  models: string[];
  filter: string;
  finish: [string, string];
}

export const DEVICE_GROUPS: DeviceGroup[] = [
  { brand: "Apple", label: "iPhone", models: ["iPhone 17 Pro", "iPhone 17", "iPhone 16 Pro", "iPhone 16"], filter: "iphone", finish: ["#C9D5E6", "#3A4356"] },
  { brand: "Samsung", label: "Galaxy", models: ["S26 Ultra", "S26", "S25 Ultra"], filter: "samsung", finish: ["#2E4A6B", "#10141C"] },
  { brand: "Google", label: "Pixel", models: ["Pixel 9 Pro", "Pixel 9"], filter: "pixel", finish: ["#7E93B0", "#232936"] },
  { brand: "OnePlus", label: "OnePlus", models: ["OnePlus 13", "OnePlus 13R"], filter: "oneplus", finish: ["#C98A2E", "#5E3D14"] },
  { brand: "Xiaomi", label: "Xiaomi", models: ["Xiaomi 15", "Redmi Note 14"], filter: "xiaomi", finish: ["#E0762E", "#7E3A12"] },
];

export interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  product: string;
  verified: boolean;
}

export const REVIEWS: Review[] = [
  { id: "r1", name: "Ananya S.", rating: 5, date: "Aug 2026", title: "Survived a bike fall", text: "Dropped my phone on concrete from the scooter mount. The Edge took the hit — not a scratch on the screen.", product: "FORM Edge", verified: true },
  { id: "r2", name: "Rohan M.", rating: 5, date: "Jul 2026", title: "Buttons feel perfect", text: "Precision fit is not marketing speak here. Every cutout lines up and the buttons click like there's no case on.", product: "FORM Black", verified: true },
  { id: "r3", name: "Priya K.", rating: 4, date: "Jul 2026", title: "Slim and premium", text: "Adds almost no bulk and the frost finish still looks new after two months. Wish there were more colours.", product: "FORM Frost", verified: true },
  { id: "r4", name: "Arjun D.", rating: 5, date: "Jun 2026", title: "MagSafe actually holds", text: "The MagCharge snaps on hard and charges fast. Using it with the Grip on my desk all day.", product: "FORM MagCharge", verified: false },
  { id: "r5", name: "Sneha R.", rating: 5, date: "Jun 2026", title: "Bought three more", text: "Got the Clear for myself, then ordered for my whole family. Packaging and finish feel properly premium.", product: "FORM Clear", verified: true },
  { id: "r6", name: "Vikram T.", rating: 4, date: "May 2026", title: "Great cable", text: "The Volt Pro readout is genuinely useful and the braid feels indestructible. Slightly stiff out of the box.", product: "FORM Volt Pro", verified: true },
];

export const ANNOUNCEMENTS = [
  "Free shipping over ₹999",
  "New drop: MagSafe series is here",
  "7-day easy returns, no questions",
];

export const POPULAR_SEARCHES = ["clear case", "magsafe", "power bank", "cable", "rugged", "stand"];
