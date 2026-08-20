// ============================================================================
// VEHICLE DATA — single source of truth for copy + specs across all scenes.
// ============================================================================
// IMPORTANT: The performance figures below are CONCEPT / PLACEHOLDER values
// carried over from the wireframe reference. They are NOT verified factory
// specifications. Replace with official source data before shipping.
// ============================================================================

export const vehicleMeta = {
  brand: "BRABUS",
  model: "Q WAGON",
  year: "2026",
  tagline: "BUILT TO BE UNREASONABLE.",
};

export const navLinks = [
  { label: "OVERVIEW", href: "#scene-01" },
  { label: "PERFORMANCE", href: "#scene-03" },
  { label: "DESIGN", href: "#scene-04" },
  { label: "TECHNOLOGY", href: "#scene-06" },
  { label: "GALLERY", href: "#scene-08" },
];

export const footerLinks = [
  { label: "LEGAL", href: "#" },
  { label: "PRIVACY", href: "#" },
  { label: "CAREERS", href: "#" },
  { label: "CONTACT", href: "#" },
];

export const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "TikTok", href: "#" },
];

// Is this figure verified? Always false until real data is supplied.
export const isSpecVerified = false;

export const specifications = [
  { key: "power", label: "POWER", value: "800", unit: "HP" },
  { key: "torque", label: "TORQUE", value: "1,000", unit: "Nm" },
  { key: "accel", label: "0–100 KM/H", value: "3.7", unit: "S" },
  { key: "topSpeed", label: "TOP SPEED", value: "240", unit: "KM/H" },
] as const;

export interface SceneDef {
  id: string;
  index: string;
  shortLabel: string;
  navLabel: string;
  eyebrow: string;
  description: string;
}

export const scenes: SceneDef[] = [
  {
    id: "scene-01",
    index: "01",
    shortLabel: "REVEAL",
    navLabel: "THE REVEAL",
    eyebrow: "SCENE 01",
    description: "Dark cinematic introduction. Light reveals the shape of the beast.",
  },
  {
    id: "scene-02",
    index: "02",
    shortLabel: "3D / HERO",
    navLabel: "3D HERO",
    eyebrow: "SCENE 02",
    description: "Fully 3D vehicle. Camera moves around the car as you scroll.",
  },
  {
    id: "scene-03",
    index: "03",
    shortLabel: "POWER",
    navLabel: "POWER",
    eyebrow: "SCENE 03",
    description: "Vehicle accelerates through a dynamic environment. Typography breaks apart.",
  },
  {
    id: "scene-04",
    index: "04",
    shortLabel: "CARBON",
    navLabel: "CARBON",
    eyebrow: "SCENE 04",
    description: "Extreme close up of the details. Texture takes over the screen.",
  },
  {
    id: "scene-05",
    index: "05",
    shortLabel: "WHEELS",
    navLabel: "WHEELS",
    eyebrow: "SCENE 05",
    description: "Exploded view of the wheel and engineering.",
  },
  {
    id: "scene-06",
    index: "06",
    shortLabel: "INTERIOR",
    navLabel: "INTERIOR",
    eyebrow: "SCENE 06",
    description: "Step inside the command center.",
  },
  {
    id: "scene-07",
    index: "07",
    shortLabel: "SPECIFICATIONS",
    navLabel: "SPECIFICATIONS",
    eyebrow: "SCENE 07",
    description: "Key performance numbers come to life.",
  },
  {
    id: "scene-08",
    index: "08",
    shortLabel: "THE BEAST",
    navLabel: "THE BEAST",
    eyebrow: "SCENE 08",
    description: "Dark. Raw. Unstoppable.",
  },
  {
    id: "scene-09",
    index: "09",
    shortLabel: "FINAL CTA",
    navLabel: "FINAL CTA",
    eyebrow: "SCENE 09",
    description: "Minimal. Bold. Straight to the point.",
  },
];

export const legendItems = [
  { label: "Content / Text", swatch: "fill" as const },
  { label: "3D / Visual Area", swatch: "cross" as const },
  { label: "Interactive / CTA", swatch: "play" as const },
  { label: "Scroll Progress", swatch: "dash" as const },
];
