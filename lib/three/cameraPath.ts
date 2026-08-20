import * as THREE from "three";
import { SCENE_RANGES } from "@/lib/constants/scroll";

// ============================================================================
// One continuous camera path sampled across the master 0..1 scroll progress.
// Keyframes correspond to the story beats described in the brief:
// reveal -> orbit hero -> power run -> carbon macro -> wheel focus ->
// interior -> specs hero -> beast close -> final pull-back.
// ============================================================================

export interface CamKeyframe {
  t: number; // 0..1 global progress
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
  /** 0..1 opacity of the exterior body vehicle group */
  bodyOpacity: number;
  /** 0..1 opacity of the wheel-assembly focus group */
  wheelFocus: number;
  /** 0..1 opacity of the interior cabin group */
  interiorFocus: number;
  /** 0..1 opacity of the carbon macro surface overlay */
  carbonFocus: number;
  /** 0..1 headlight emissive intensity multiplier */
  headlight: number;
  /** 0..1 fog density multiplier */
  fog: number;
}

const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export const CAMERA_KEYFRAMES: CamKeyframe[] = [
  // 01 REVEAL — stage lights up as cover lifts, camera slowly pushes in
  { t: 0.0, pos: P(0, 1.4, 9.5), look: P(0, 0.9, 0), fov: 32, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0.1, fog: 0.6 },
  { t: 0.11, pos: P(0, 1.2, 6.4), look: P(0, 0.85, 0), fov: 30, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0.6, fog: 0.3 },

  // 02 HERO — orbit: front -> 3/4 -> side -> rear 3/4 -> rear
  { t: 0.13, pos: P(0, 1.3, 6.2), look: P(0, 0.8, 0), fov: 34, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0.7, fog: 0.35 },
  { t: 0.165, pos: P(3.4, 1.4, 4.8), look: P(0, 0.7, 0), fov: 34, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0.75, fog: 0.25 },
  { t: 0.2, pos: P(5.6, 1.5, 0.3), look: P(0, 0.65, 0), fov: 34, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0.6, fog: 0.2 },
  { t: 0.235, pos: P(3.2, 1.6, -4.6), look: P(0, 0.65, 0), fov: 34, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0.4, fog: 0.2 },
  { t: 0.24, pos: P(0, 1.6, -6.4), look: P(0, 0.65, 0), fov: 34, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0.3, fog: 0.2 },

  // 03 POWER — the car surges toward camera, aggressive low fast push
  { t: 0.27, pos: P(0.8, 1.0, 6.6), look: P(0, 0.8, -2), fov: 42, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0.8, fog: 0.15 },
  { t: 0.33, pos: P(-0.8, 0.85, 4.4), look: P(0, 0.75, -4), fov: 50, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0.9, fog: 0.1 },
  { t: 0.36, pos: P(0, 0.95, 4.8), look: P(0, 0.8, 0), fov: 38, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0.6, fog: 0.15 },

  // 04 CARBON — extreme macro push into the bodywork, body fades into weave
  { t: 0.4, pos: P(1.1, 1.0, 1.6), look: P(0.9, 0.9, 0.4), fov: 26, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0.2, headlight: 0.3, fog: 0.05 },
  { t: 0.47, pos: P(0.55, 0.95, 0.55), look: P(0.5, 0.9, 0.2), fov: 18, bodyOpacity: 0.15, wheelFocus: 0, interiorFocus: 0, carbonFocus: 1, headlight: 0.1, fog: 0.02 },

  // 05 WHEELS — pull back and drop to the wheel, exploded assembly
  { t: 0.5, pos: P(2.3, 1.05, 1.9), look: P(1.6, 0.62, 0.4), fov: 32, bodyOpacity: 0.35, wheelFocus: 0.4, interiorFocus: 0, carbonFocus: 0, headlight: 0.15, fog: 0.05 },
  { t: 0.57, pos: P(2.85, 0.95, 0.9), look: P(1.6, 0.62, 0), fov: 30, bodyOpacity: 0.08, wheelFocus: 1, interiorFocus: 0, carbonFocus: 0, headlight: 0.05, fog: 0.02 },
  { t: 0.6, pos: P(2.2, 1.4, 2.4), look: P(0.3, 0.9, 0), fov: 30, bodyOpacity: 0.05, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0, fog: 0.02 },

  // 06 INTERIOR — 360° orbital sweep inside the cabin
  // GLB interior positions (meters): cabin center ≈ (0, 1.15, 0.0)
  //   Steering wheel: (0.41, 1.25, 0.36)   Driver seat: (0.41, 1.22, -0.13)
  //   Passenger seat: (-0.42, 1.21, -0.13) Dashboard: (0.43, 1.33, 0.63)
  //   Rear seats: (-0.005, 1.03, -0.87)   FL door: (0.75, 1.11, 0.35)
  //
  // Camera enters from driver's door, then does a full 360° orbit inside
  // the cabin looking inward — showing dash, both seats, door panels,
  // steering wheel, gauges, center console, and rear in one continuous sweep.
  //
  // Entry (0.60–0.62): Approach from outside driver's door
  // Push in (0.62–0.63): Through the door into the cabin
  // Orbit start (0.63): Front dash view (looking at windshield/steering)
  // 90° (0.645): Passenger side door panel
  // 180° (0.655): Rear seats, rear console
  // 270° (0.665): Driver door panel, steering wheel close-up
  // 360° (0.675): Back to front dash, gauges glowing
  // Pull out (0.68–0.69): Slow pull back toward center before transition

  // Entry — outside driver's door, body fading
  { t: 0.60, pos: P(-1.5, 1.3, 0.2),    look: P(0.1, 1.15, 0.1), fov: 36, bodyOpacity: 0.4, wheelFocus: 0, interiorFocus: 0.05, carbonFocus: 0, headlight: 0, fog: 0.02 },
  // Push through the door
  { t: 0.62, pos: P(-0.6, 1.22, 0.0),    look: P(0.1, 1.15, 0.15), fov: 42, bodyOpacity: 0.1, wheelFocus: 0, interiorFocus: 0.4, carbonFocus: 0, headlight: 0, fog: 0.02 },
  // 360° ORBIT — cabin center at (0, 1.15, 0.0), radius ~0.55
  // 0° — Front: looking at dashboard, windshield, steering wheel from behind seats
  { t: 0.63, pos: P(0, 1.2, 0.55),      look: P(0, 1.1, -0.1), fov: 52, bodyOpacity: 0, wheelFocus: 0, interiorFocus: 0.7, carbonFocus: 0, headlight: 0, fog: 0.02 },
  // 60° — Front-right: steering wheel + gauges close-up from driver's angle
  { t: 0.64, pos: P(0.48, 1.2, 0.28),    look: P(0, 1.1, -0.05), fov: 50, bodyOpacity: 0, wheelFocus: 0, interiorFocus: 1, carbonFocus: 0, headlight: 0, fog: 0.02 },
  // 120° — Right: passenger door panel, passenger seat, right side of dash
  { t: 0.65, pos: P(0.55, 1.18, -0.2),   look: P(0, 1.1, 0), fov: 50, bodyOpacity: 0, wheelFocus: 0, interiorFocus: 1, carbonFocus: 0, headlight: 0, fog: 0.02 },
  // 180° — Rear: rear seats, rear console, looking back through cabin
  { t: 0.66, pos: P(0, 1.18, -0.55),     look: P(0, 1.12, 0.1), fov: 50, bodyOpacity: 0, wheelFocus: 0, interiorFocus: 1, carbonFocus: 0, headlight: 0, fog: 0.02 },
  // 240° — Left: driver door panel, steering wheel from the side
  { t: 0.67, pos: P(-0.55, 1.18, -0.2),  look: P(0, 1.12, 0.1), fov: 50, bodyOpacity: 0, wheelFocus: 0, interiorFocus: 1, carbonFocus: 0, headlight: 0, fog: 0.02 },
  // 300° — Front-left: driver's perspective of dash, cluster glowing
  { t: 0.68, pos: P(-0.48, 1.2, 0.28),   look: P(0.1, 1.1, 0.1), fov: 48, bodyOpacity: 0, wheelFocus: 0, interiorFocus: 1, carbonFocus: 0, headlight: 0, fog: 0.02 },
  // 360° — Back to front, slow pull up and center for the transition out
  { t: 0.69, pos: P(0, 1.3, 0.4),        look: P(0, 1.08, -0.1), fov: 46, bodyOpacity: 0, wheelFocus: 0, interiorFocus: 1, carbonFocus: 0, headlight: 0, fog: 0.02 },

  // 07 SPECIFICATIONS — return to a clean, confident 3/4 hero shot
  { t: 0.72, pos: P(4.2, 1.3, 3.6), look: P(0, 0.7, 0), fov: 32, bodyOpacity: 0.6, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0.5, fog: 0.1 },
  { t: 0.81, pos: P(4.6, 1.15, 3.2), look: P(0, 0.65, 0), fov: 30, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0.55, fog: 0.1 },

  // 08 THE BEAST — dead-on low front shot, headlights blazing out of black
  { t: 0.85, pos: P(0.4, 0.85, 7.4), look: P(0, 0.85, 0), fov: 32, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 1, fog: 0.5 },
  { t: 0.92, pos: P(0.4, 0.8, 5.6), look: P(0, 0.85, 0), fov: 30, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 1.3, fog: 0.7 },

  // 09 FINAL CTA — settle back, quiet, dim silhouette
  { t: 1.0, pos: P(0, 1.0, 8.4), look: P(0, 0.8, 0), fov: 30, bodyOpacity: 1, wheelFocus: 0, interiorFocus: 0, carbonFocus: 0, headlight: 0.35, fog: 0.65 },
];

function findSegment(t: number) {
  const kf = CAMERA_KEYFRAMES;
  for (let i = 0; i < kf.length - 1; i++) {
    if (t >= kf[i].t && t <= kf[i + 1].t) return i;
  }
  return kf.length - 2;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / Math.max(1e-6, edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Samples the full camera state at a given global progress (0..1). */
export function sampleCameraPath(progress: number) {
  const t = Math.min(1, Math.max(0, progress));
  const i = findSegment(t);
  const a = CAMERA_KEYFRAMES[i];
  const b = CAMERA_KEYFRAMES[i + 1];
  const span = Math.max(1e-6, b.t - a.t);
  const local = smoothstep(0, 1, (t - a.t) / span);

  const pos = a.pos.clone().lerp(b.pos, local);
  const look = a.look.clone().lerp(b.look, local);
  const fov = THREE.MathUtils.lerp(a.fov, b.fov, local);
  const bodyOpacity = THREE.MathUtils.lerp(a.bodyOpacity, b.bodyOpacity, local);
  const wheelFocus = THREE.MathUtils.lerp(a.wheelFocus, b.wheelFocus, local);
  const interiorFocus = THREE.MathUtils.lerp(a.interiorFocus, b.interiorFocus, local);
  const carbonFocus = THREE.MathUtils.lerp(a.carbonFocus, b.carbonFocus, local);
  const headlight = THREE.MathUtils.lerp(a.headlight, b.headlight, local);
  const fog = THREE.MathUtils.lerp(a.fog, b.fog, local);

  return { pos, look, fov, bodyOpacity, wheelFocus, interiorFocus, carbonFocus, headlight, fog };
}

export { SCENE_RANGES };
