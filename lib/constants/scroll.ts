// ============================================================================
// Global scroll choreography constants.
// The entire experience is one continuous scroll timeline (progress 0 -> 1)
// spanning all 9 scenes. Each scene owns a slice of that range. The 3D
// camera rig samples this same range to produce one unbroken camera path.
// ============================================================================

export type SceneKey =
  | "reveal"
  | "hero"
  | "power"
  | "carbon"
  | "wheels"
  | "interior"
  | "specifications"
  | "beast"
  | "finalCta";

export interface SceneRange {
  key: SceneKey;
  id: string;
  start: number;
  end: number;
}

// Each scene's [start, end) slice of the master 0..1 scroll progress.
export const SCENE_RANGES: SceneRange[] = [
  { key: "reveal", id: "scene-01", start: 0.0, end: 0.11 },
  { key: "hero", id: "scene-02", start: 0.11, end: 0.24 },
  { key: "power", id: "scene-03", start: 0.24, end: 0.36 },
  { key: "carbon", id: "scene-04", start: 0.36, end: 0.47 },
  { key: "wheels", id: "scene-05", start: 0.47, end: 0.58 },
  { key: "interior", id: "scene-06", start: 0.58, end: 0.69 },
  { key: "specifications", id: "scene-07", start: 0.69, end: 0.81 },
  { key: "beast", id: "scene-08", start: 0.81, end: 0.92 },
  { key: "finalCta", id: "scene-09", start: 0.92, end: 1.0 },
];

export function rangeFor(key: SceneKey): SceneRange {
  const r = SCENE_RANGES.find((s) => s.key === key);
  if (!r) throw new Error(`Unknown scene key: ${key}`);
  return r;
}

// Normalize global progress into a local 0..1 value within a scene's range,
// clamped. Useful for driving per-scene animation (typography, HUD reveals).
export function localProgress(global: number, key: SceneKey): number {
  const { start, end } = rangeFor(key);
  if (end <= start) return 0;
  return Math.min(1, Math.max(0, (global - start) / (end - start)));
}

// Total scroll distance for the whole one-page film. Section heights below
// are DERIVED from SCENE_RANGES so that "global scroll progress" (what the
// camera path reads) always lines up exactly with which section is actually
// in view — no drift between the visible DOM section and the 3D state.
export const TOTAL_SCROLL_VH = 1700;

// Per-section scroll "height" in viewport units — taller sections give the
// pinned 3D camera move more scroll distance to interpolate across, i.e.
// slower / more cinematic movement for the big spectacle scenes.
export const SECTION_HEIGHT_VH: Record<SceneKey, number> = SCENE_RANGES.reduce(
  (acc, r) => {
    acc[r.key] = Math.round((r.end - r.start) * TOTAL_SCROLL_VH);
    return acc;
  },
  {} as Record<SceneKey, number>
);
