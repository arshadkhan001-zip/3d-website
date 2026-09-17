/**
 * Placeholder catalog — structured local data, no backend.
 * Every field needed later (detail pages, model/variant selection,
 * wishlist, cart, search, collections) is present; checkout/cart
 * logic is intentionally NOT implemented in this stage.
 */

export type Availability = "in-stock" | "low-stock" | "preorder";

export type Brand = "iphone" | "samsung" | "oneplus" | "pixel" | "xiaomi";
export type ShopTag = "transparent" | "protective" | "minimal";

export type Category =
  | "cases"
  | "screen"
  | "camera"
  | "charging"
  | "cables"
  | "power"
  | "grips"
  | "stands"
  | "magsafe"
  | "auto";

export type ShopFilter =
  | "all"
  | Brand
  | ShopTag;

export const SHOP_FILTERS: { id: ShopFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "iphone", label: "iPhone" },
  { id: "samsung", label: "Samsung" },
  { id: "oneplus", label: "OnePlus" },
  { id: "transparent", label: "Transparent" },
  { id: "protective", label: "Protective" },
  { id: "minimal", label: "Minimal" },
];

/** Demo catalog entries — replace with real products/images later. */
export const DEMO_CATALOG = true;

export interface ProductVariant {
  id: string;
  label: string;
  /** CSS swatch color for the placeholder visual. */
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  index: string;
  name: string;
  series: string;
  description: string;
  /** Price in INR (minor-free integer). */
  price: number;
  compareAt?: number;
  currency: "INR";
  compatibility: string[];
  category: string;
  /** Filter dimensions for the shop section. */
  brands: Brand[];
  tags: ShopTag[];
  material: string;
  badge?: string;
  availability: Availability;
  variants: ProductVariant[];
  /** CSS gradient stops for the placeholder cover visual. */
  finish: [string, string];
  /** Stage 9+: category, stock, compare-at. Optional so older entries keep working. */
  kind?: Category;
  stock?: number;
}

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  preorder: "Preorder",
};

const priceFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPrice(inr: number): string {
  return priceFmt.format(inr);
}

export const PRODUCTS: Product[] = [
  {
    id: "form-clear",
    slug: "form-clear",
    index: "01",
    name: "FORM Clear",
    series: "Crystal Series",
    description: "Crystal-clear shell that shows the phone as designed.",
    price: 799,
    currency: "INR",
    compatibility: ["iPhone 16", "Galaxy S24", "Pixel 9"],
    category: "Clear",
    brands: ["iphone", "samsung", "oneplus"],
    tags: ["transparent", "minimal"],
    material: "Crystal",
    badge: "Bestseller",
    availability: "in-stock",
    variants: [
      { id: "clear", label: "Clear", hex: "#B9C6D8" },
      { id: "smoke", label: "Smoke", hex: "#3A4356" },
    ],
    finish: ["#C9D5E6", "#5E6E88"],
  },
  {
    id: "form-black",
    slug: "form-black",
    index: "02",
    name: "FORM Black",
    series: "Essential Series",
    description: "Matte black everyday cover with a quiet grip.",
    price: 899,
    currency: "INR",
    compatibility: ["iPhone 16", "Galaxy S24", "Pixel 9"],
    category: "Everyday",
    brands: ["iphone", "samsung"],
    tags: ["protective", "minimal"],
    material: "Silicone",
    availability: "in-stock",
    variants: [
      { id: "black", label: "Black", hex: "#15181F" },
      { id: "graphite", label: "Graphite", hex: "#2E3440" },
    ],
    finish: ["#232936", "#0C0F16"],
  },
  {
    id: "form-frost",
    slug: "form-frost",
    index: "03",
    name: "FORM Frost",
    series: "Matte Series",
    description: "Soft-touch frosted finish that resists fingerprints.",
    price: 999,
    currency: "INR",
    compatibility: ["iPhone 16", "Galaxy S24"],
    category: "Matte",
    brands: ["iphone", "samsung", "oneplus"],
    tags: ["minimal"],
    material: "Matte",
    badge: "New",
    availability: "in-stock",
    variants: [
      { id: "frost", label: "Frost", hex: "#D8D5CE" },
      { id: "mist", label: "Mist", hex: "#9AA3B2" },
    ],
    finish: ["#E3E0D8", "#8E97A6"],
  },
  {
    id: "form-carbon",
    slug: "form-carbon",
    index: "04",
    name: "FORM Carbon",
    series: "Armor Series",
    description: "Layered armor build for drops, bumps and daily knocks.",
    price: 1099,
    currency: "INR",
    compatibility: ["iPhone 16 Pro", "Galaxy S24 Ultra"],
    category: "Armor",
    brands: ["iphone", "samsung"],
    tags: ["protective"],
    material: "Armor",
    availability: "low-stock",
    variants: [
      { id: "carbon", label: "Carbon", hex: "#23262B" },
      { id: "ember", label: "Ember", hex: "#E0762E" },
    ],
    finish: ["#3A3E46", "#121316"],
  },
  {
    id: "form-stone",
    slug: "form-stone",
    index: "05",
    name: "FORM Stone",
    series: "Minimal Series",
    description: "A calm stone texture with a slim, pocketable profile.",
    price: 999,
    currency: "INR",
    compatibility: ["iPhone 16", "Pixel 9"],
    category: "Minimal",
    brands: ["iphone", "oneplus"],
    tags: ["minimal"],
    material: "Silicone",
    availability: "in-stock",
    variants: [
      { id: "stone", label: "Stone", hex: "#C9C2B4" },
      { id: "clay", label: "Clay", hex: "#8A7B6C" },
    ],
    finish: ["#D3CDBF", "#7E7466"],
  },
  {
    id: "form-blue",
    slug: "form-blue",
    index: "06",
    name: "FORM Blue",
    series: "Studio Series",
    description: "Deep studio blue with a smooth satin feel.",
    price: 899,
    currency: "INR",
    compatibility: ["iPhone 16", "Galaxy S24", "Pixel 9"],
    category: "Studio",
    brands: ["iphone", "samsung", "oneplus"],
    tags: ["minimal"],
    material: "Matte",
    availability: "preorder",
    variants: [
      { id: "blue", label: "Studio Blue", hex: "#2E4A6B" },
      { id: "ink", label: "Ink", hex: "#10141C" },
    ],
    finish: ["#3E5E85", "#141C29"],
  },
  {
    id: "form-edge",
    slug: "form-edge",
    index: "07",
    name: "FORM Edge",
    series: "Edge Protection Series",
    description: "A raised perimeter that takes the hit before your screen does.",
    price: 1099,
    currency: "INR",
    compatibility: ["iPhone 16", "Galaxy S24", "OnePlus 12"],
    category: "Protective",
    brands: ["iphone", "samsung", "oneplus"],
    tags: ["protective"],
    material: "Armor",
    badge: "New",
    availability: "in-stock",
    variants: [
      { id: "slate", label: "Slate", hex: "#4A5261" },
      { id: "black", label: "Black", hex: "#15181F" },
    ],
    finish: ["#4A5261", "#141821"],
  },
  {
    id: "form-armor",
    slug: "form-armor",
    index: "08",
    name: "FORM Armor",
    series: "Impact Series",
    description: "Dual-layer impact build for serious drops and rough days.",
    price: 1199,
    currency: "INR",
    compatibility: ["iPhone 16 Pro", "Galaxy S24 Ultra"],
    category: "Protective",
    brands: ["iphone", "samsung"],
    tags: ["protective"],
    material: "Armor",
    availability: "low-stock",
    variants: [
      { id: "graphite", label: "Graphite", hex: "#2E3440" },
      { id: "black", label: "Black", hex: "#0B0D12" },
    ],
    finish: ["#2E3440", "#0B0D12"],
  },
  {
    id: "form-matte",
    slug: "form-matte",
    index: "09",
    name: "FORM Matte",
    series: "Soft Touch Series",
    description: "Velvety soft-touch coating with a clean matte look.",
    price: 999,
    currency: "INR",
    compatibility: ["Galaxy S24", "OnePlus 12"],
    category: "Matte",
    brands: ["samsung", "oneplus"],
    tags: ["minimal"],
    material: "Silicone",
    availability: "in-stock",
    variants: [
      { id: "fog", label: "Fog", hex: "#6B7280" },
      { id: "ink", label: "Ink", hex: "#23262B" },
    ],
    finish: ["#6B7280", "#23262B"],
  },
  {
    id: "form-ghost",
    slug: "form-ghost",
    index: "10",
    name: "FORM Ghost",
    series: "Transparent Series",
    description: "Barely-there transparency with anti-yellow coating.",
    price: 899,
    currency: "INR",
    compatibility: ["iPhone 16", "OnePlus 12"],
    category: "Clear",
    brands: ["iphone", "oneplus"],
    tags: ["transparent", "minimal"],
    material: "Crystal",
    availability: "in-stock",
    variants: [
      { id: "ghost", label: "Ghost", hex: "#DDE5F0" },
      { id: "frost", label: "Frost", hex: "#9AA3B2" },
    ],
    finish: ["#DDE5F0", "#7E93B0"],
  },
  {
    id: "form-shield",
    slug: "form-shield",
    index: "11",
    name: "FORM Shield",
    series: "Defender Series",
    description: "Maximum-coverage defender with reinforced corners.",
    price: 1299,
    currency: "INR",
    compatibility: ["iPhone 16 Pro", "Galaxy S24 Ultra"],
    category: "Protective",
    brands: ["iphone", "samsung"],
    tags: ["protective"],
    material: "Armor",
    availability: "preorder",
    variants: [
      { id: "midnight", label: "Midnight", hex: "#1F2530" },
      { id: "black", label: "Black", hex: "#090B0F" },
    ],
    finish: ["#1F2530", "#090B0F"],
  },
  {
    id: "form-air",
    slug: "form-air",
    index: "12",
    name: "FORM Air",
    series: "Ultralight Series",
    description: "Featherweight protection you forget you are carrying.",
    price: 999,
    currency: "INR",
    compatibility: ["iPhone 16", "Galaxy S24", "Pixel 9"],
    category: "Minimal",
    brands: ["iphone", "samsung", "oneplus"],
    tags: ["minimal", "transparent"],
    material: "Crystal",
    availability: "in-stock",
    variants: [
      { id: "air", label: "Air", hex: "#C7D2E2" },
      { id: "smoke", label: "Smoke", hex: "#55637A" },
    ],
    finish: ["#C7D2E2", "#55637A"],
  },
  /* ── Accessories (demo entries — same replaceable structure) ── */
  {
    id: "form-tempered",
    slug: "form-tempered",
    index: "13",
    name: "FORM Tempered",
    series: "Shield Glass Series",
    description: "9H tempered glass with alignment-frame install.",
    price: 499,
    compareAt: 699,
    currency: "INR",
    compatibility: ["Universal fit"],
    category: "Screen",
    brands: ["iphone", "samsung", "oneplus", "pixel", "xiaomi"],
    tags: ["minimal"],
    material: "Glass",
    kind: "screen",
    stock: 40,
    badge: "Sale",
    availability: "in-stock",
    variants: [
      { id: "clear", label: "Clear", hex: "#DDE5F0" },
      { id: "privacy", label: "Privacy", hex: "#23262B" },
    ],
    finish: ["#C9D5E6", "#6B7A90"],
  },
  {
    id: "form-privacy",
    slug: "form-privacy",
    index: "14",
    name: "FORM Privacy",
    series: "Shield Glass Series",
    description: "Two-way privacy filter with smudge resistance.",
    price: 799,
    currency: "INR",
    compatibility: ["Universal fit"],
    category: "Screen",
    brands: ["iphone", "samsung", "oneplus", "pixel", "xiaomi"],
    tags: ["minimal"],
    material: "Glass",
    kind: "screen",
    stock: 22,
    availability: "in-stock",
    variants: [{ id: "privacy", label: "Privacy", hex: "#23262B" }],
    finish: ["#3A4356", "#0C0F16"],
  },
  {
    id: "form-lens",
    slug: "form-lens",
    index: "15",
    name: "FORM Lens Guard",
    series: "Camera Series",
    description: "Sapphire-coated lens rings, case-friendly fit.",
    price: 399,
    currency: "INR",
    compatibility: ["Universal fit"],
    category: "Camera",
    brands: ["iphone", "samsung", "oneplus", "pixel", "xiaomi"],
    tags: ["minimal"],
    material: "Aluminum",
    kind: "camera",
    stock: 35,
    availability: "in-stock",
    variants: [
      { id: "silver", label: "Silver", hex: "#B9C6D8" },
      { id: "black", label: "Black", hex: "#15181F" },
    ],
    finish: ["#9AA3B2", "#3A4356"],
  },
  {
    id: "form-magcharge",
    slug: "form-magcharge",
    index: "16",
    name: "FORM MagCharge",
    series: "MagSafe Series",
    description: "15W magnetic wireless charger with braided cable.",
    price: 1999,
    currency: "INR",
    compatibility: ["MagSafe compatible"],
    category: "Charging",
    brands: ["iphone", "samsung", "oneplus", "pixel", "xiaomi"],
    tags: ["minimal"],
    material: "Aluminum",
    kind: "magsafe",
    stock: 18,
    badge: "New",
    availability: "in-stock",
    variants: [
      { id: "silver", label: "Silver", hex: "#C9D5E6" },
      { id: "graphite", label: "Graphite", hex: "#2E3440" },
    ],
    finish: ["#8E97A6", "#232936"],
  },
  {
    id: "form-volt",
    slug: "form-volt",
    index: "17",
    name: "FORM Volt Cable",
    series: "Cable Series",
    description: "60W braided USB-C cable, 1.5m, strain-relief ends.",
    price: 499,
    currency: "INR",
    compatibility: ["USB-C devices"],
    category: "Cables",
    brands: ["iphone", "samsung", "oneplus", "pixel", "xiaomi"],
    tags: ["minimal"],
    material: "Nylon",
    kind: "cables",
    stock: 60,
    availability: "in-stock",
    variants: [
      { id: "bone", label: "Bone", hex: "#ECE7DB" },
      { id: "black", label: "Black", hex: "#15181F" },
    ],
    finish: ["#D3CDBF", "#4A5261"],
  },
  {
    id: "form-volt-pro",
    slug: "form-volt-pro",
    index: "18",
    name: "FORM Volt Pro",
    series: "Cable Series",
    description: "120W fast-charge cable with LED power readout.",
    price: 799,
    currency: "INR",
    compatibility: ["USB-C devices"],
    category: "Cables",
    brands: ["iphone", "samsung", "oneplus", "pixel", "xiaomi"],
    tags: ["minimal"],
    material: "Nylon",
    kind: "cables",
    stock: 44,
    availability: "in-stock",
    variants: [{ id: "black", label: "Black", hex: "#15181F" }],
    finish: ["#2E3440", "#0B0D12"],
  },
  {
    id: "form-power-10k",
    slug: "form-power-10k",
    index: "19",
    name: "FORM Power 10K",
    series: "Power Series",
    description: "10,000mAh bank with 22.5W two-way fast charging.",
    price: 2499,
    compareAt: 2999,
    currency: "INR",
    compatibility: ["USB-C devices"],
    category: "Power",
    brands: ["iphone", "samsung", "oneplus", "pixel", "xiaomi"],
    tags: ["minimal"],
    material: "Polycarbonate",
    kind: "power",
    stock: 15,
    badge: "Bestseller",
    availability: "in-stock",
    variants: [
      { id: "bone", label: "Bone", hex: "#ECE7DB" },
      { id: "graphite", label: "Graphite", hex: "#2E3440" },
    ],
    finish: ["#E3E0D8", "#5E6E88"],
  },
  {
    id: "form-power-mini",
    slug: "form-power-mini",
    index: "20",
    name: "FORM Power Mini",
    series: "Power Series",
    description: "5,000mAh pocket bank with built-in USB-C plug.",
    price: 1799,
    currency: "INR",
    compatibility: ["USB-C devices"],
    category: "Power",
    brands: ["iphone", "samsung", "oneplus", "pixel", "xiaomi"],
    tags: ["minimal"],
    material: "Polycarbonate",
    kind: "power",
    stock: 27,
    availability: "in-stock",
    variants: [{ id: "blue", label: "Studio Blue", hex: "#2E4A6B" }],
    finish: ["#3E5E85", "#141C29"],
  },
  {
    id: "form-grip",
    slug: "form-grip",
    index: "21",
    name: "FORM Grip",
    series: "Grip Series",
    description: "MagSafe phone grip with flip-out stand.",
    price: 399,
    currency: "INR",
    compatibility: ["MagSafe compatible"],
    category: "Grip",
    brands: ["iphone", "samsung", "oneplus", "pixel", "xiaomi"],
    tags: ["minimal"],
    material: "Silicone",
    kind: "grips",
    stock: 50,
    badge: "New",
    availability: "in-stock",
    variants: [
      { id: "ember", label: "Ember", hex: "#E0762E" },
      { id: "black", label: "Black", hex: "#15181F" },
    ],
    finish: ["#E0762E", "#7E3A12"],
  },
  {
    id: "form-stand",
    slug: "form-stand",
    index: "22",
    name: "FORM Stand",
    series: "Desk Series",
    description: "Weighted aluminum desk stand, portrait + landscape.",
    price: 899,
    currency: "INR",
    compatibility: ["Universal fit"],
    category: "Stands",
    brands: ["iphone", "samsung", "oneplus", "pixel", "xiaomi"],
    tags: ["minimal"],
    material: "Aluminum",
    kind: "stands",
    stock: 31,
    availability: "in-stock",
    variants: [{ id: "silver", label: "Silver", hex: "#B9C6D8" }],
    finish: ["#9AA3B2", "#4A5261"],
  },
  {
    id: "form-magwallet",
    slug: "form-magwallet",
    index: "23",
    name: "FORM MagWallet",
    series: "MagSafe Series",
    description: "Vegan-leather magnetic wallet for 3 cards.",
    price: 1299,
    currency: "INR",
    compatibility: ["MagSafe compatible"],
    category: "MagSafe",
    brands: ["iphone", "samsung", "oneplus", "pixel", "xiaomi"],
    tags: ["minimal"],
    material: "Vegan leather",
    kind: "magsafe",
    stock: 20,
    availability: "low-stock",
    variants: [
      { id: "tan", label: "Tan", hex: "#C98A2E" },
      { id: "black", label: "Black", hex: "#15181F" },
    ],
    finish: ["#C98A2E", "#5E3D14"],
  },
  {
    id: "form-car-dock",
    slug: "form-car-dock",
    index: "24",
    name: "FORM Car Dock",
    series: "Drive Series",
    description: "Magnetic car mount with 15W charging, vent + dash.",
    price: 1499,
    currency: "INR",
    compatibility: ["MagSafe compatible"],
    category: "Car",
    brands: ["iphone", "samsung", "oneplus", "pixel", "xiaomi"],
    tags: ["minimal"],
    material: "Aluminum",
    kind: "auto",
    stock: 0,
    availability: "preorder",
    variants: [{ id: "black", label: "Black", hex: "#15181F" }],
    finish: ["#2E3440", "#090B0F"],
  },
];

export function matchesFilter(p: Product, filter: ShopFilter): boolean {
  if (filter === "all") return true;
  return p.brands.includes(filter as Brand) || p.tags.includes(filter as ShopTag);
}

export function materialCount(): number {
  return new Set(PRODUCTS.map((p) => p.material)).size;
}

/** Category with fallback (original 12 entries are cases). */
export function kindFor(p: Product): Category {
  return p.kind ?? "cases";
}

/** Stock with fallback. No fake precision — buckets only in UI. */
export function stockFor(p: Product): number {
  return p.stock ?? 12;
}

export function colorsFor(p: Product): { label: string; hex: string }[] {
  return p.variants.map((v) => ({ label: v.label, hex: v.hex }));
}

/* ── Stage 8: detail-page model (all placeholder/demo unless noted) ── */

export interface PhoneModel {
  id: string;
  label: string;
  brand: Brand;
  brandLabel: string;
}

export const PHONE_MODELS: PhoneModel[] = [
  { id: "iphone-17-pro", label: "iPhone 17 Pro", brand: "iphone", brandLabel: "Apple" },
  { id: "iphone-17", label: "iPhone 17", brand: "iphone", brandLabel: "Apple" },
  { id: "iphone-16-pro", label: "iPhone 16 Pro", brand: "iphone", brandLabel: "Apple" },
  { id: "iphone-16", label: "iPhone 16", brand: "iphone", brandLabel: "Apple" },
  { id: "galaxy-s26-ultra", label: "Galaxy S26 Ultra", brand: "samsung", brandLabel: "Samsung" },
  { id: "galaxy-s26", label: "Galaxy S26", brand: "samsung", brandLabel: "Samsung" },
  { id: "galaxy-s25-ultra", label: "Galaxy S25 Ultra", brand: "samsung", brandLabel: "Samsung" },
  { id: "oneplus-13", label: "OnePlus 13", brand: "oneplus", brandLabel: "OnePlus" },
  { id: "oneplus-13r", label: "OnePlus 13R", brand: "oneplus", brandLabel: "OnePlus" },
];

/** DEMO fitment table — replace with real per-product fitment later. */
const MODEL_SUPPORT: Record<string, string[]> = {
  "form-clear": ["iphone-16", "galaxy-s26", "oneplus-13"],
  "form-black": ["iphone-16", "iphone-17", "galaxy-s26"],
  "form-frost": ["iphone-16", "galaxy-s26", "oneplus-13"],
  "form-carbon": ["iphone-16-pro", "galaxy-s26-ultra"],
  "form-stone": ["iphone-16", "oneplus-13"],
  "form-blue": ["iphone-17", "galaxy-s26", "oneplus-13r"],
  "form-edge": ["iphone-17-pro", "galaxy-s26", "oneplus-13"],
  "form-armor": ["iphone-16-pro", "galaxy-s26-ultra"],
  "form-matte": ["galaxy-s26", "oneplus-13"],
  "form-ghost": ["iphone-17", "oneplus-13r"],
  "form-shield": ["iphone-17-pro", "galaxy-s26-ultra"],
  "form-air": ["iphone-16", "galaxy-s26", "oneplus-13"],
};

export function modelsFor(productId: string): PhoneModel[] {
  const ids = MODEL_SUPPORT[productId] ?? [];
  return PHONE_MODELS.filter((m) => ids.includes(m.id));
}

/**
 * DEMO variant×model limits — `"product:variant" -> allowed model ids`.
 * Absent entry = variant fits all of the product's models.
 */
const VARIANT_MODEL_LIMITS: Record<string, string[]> = {
  "form-carbon:ember": ["iphone-16-pro"],
  "form-shield:midnight": ["galaxy-s26-ultra"],
};

export function allowedModels(productId: string, variantId: string): PhoneModel[] {
  const all = modelsFor(productId);
  const limited = VARIANT_MODEL_LIMITS[`${productId}:${variantId}`];
  if (!limited) return all;
  return all.filter((m) => limited.includes(m.id));
}

export interface ProductSpec {
  label: string;
  value: string;
  /** True = placeholder copy, replace with verified specs later. */
  placeholder: boolean;
}

/** DEMO specs — generic, clearly flagged; do not treat as verified claims. */
export function specsFor(p: Product): ProductSpec[] {
  const protective = p.tags.includes("protective");
  return [
    { label: "Protection", value: protective ? "Raised-edge armor profile" : "Raised-edge everyday profile", placeholder: true },
    { label: "Material", value: p.material, placeholder: false },
    { label: "Profile", value: "Slim, pocketable", placeholder: true },
    { label: "Compatibility", value: p.compatibility.join(" · "), placeholder: false },
    { label: "Charging", value: "Wireless-charging friendly", placeholder: true },
    { label: "Weight", value: "Lightweight", placeholder: true },
  ];
}

/** DEMO ratings — replace with real review aggregates later. */
const RATINGS: Record<string, { rating: number; reviews: number }> = {
  "form-clear": { rating: 4.8, reviews: 214 },
  "form-carbon": { rating: 4.9, reviews: 167 },
};

export function ratingFor(productId: string): { rating: number; reviews: number } {
  return RATINGS[productId] ?? { rating: 4.7, reviews: 86 };
}

export interface GalleryView {
  id: string;
  label: string;
  alt: string;
  /** Set when real photography exists — renders <img> instead of CSS visual. */
  src?: string;
}

/** Gallery architecture: CSS placeholder visuals today, real src tomorrow. */
export function galleryFor(p: Product): GalleryView[] {
  return [
    { id: "front", label: "Front", alt: `${p.name} — front view (stylized placeholder)` },
    { id: "angle", label: "Angle", alt: `${p.name} — angle view (stylized placeholder)` },
    { id: "detail", label: "Detail", alt: `${p.name} — camera detail (stylized placeholder)` },
  ];
}

export function productBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/**
 * Store assurances — PLACEHOLDER policy UI, not confirmed business terms.
 * Confirm real shipping/returns policy before presenting as fact.
 */
export const STORE_INFO = {
  shipping: "Free shipping over ₹999",
  returns: "7-day easy returns",
  checkout: "Secure checkout",
  placeholder: true,
} as const;
