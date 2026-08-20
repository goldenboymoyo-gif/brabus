// ============================================================================
// Lightweight mutable singleton for scroll-driven 3D state.
// Written by GSAP ScrollTrigger's onUpdate (outside React), read every frame
// inside R3F useFrame loops. Avoids React re-renders for high-frequency
// scroll data — critical for keeping the render loop at 60fps.
// ============================================================================

export interface ScrollState {
  /** Master scroll progress across the entire page, 0..1 */
  progress: number;
  /** Signed scroll velocity, roughly -1..1, decays toward 0 when idle */
  velocity: number;
  /** Viewport dimensions, kept in sync for responsive 3D sizing decisions */
  width: number;
  height: number;
  /** True on touch / small viewports — scenes should reduce 3D cost */
  reducedFx: boolean;
}

export const scrollState: ScrollState = {
  progress: 0,
  velocity: 0,
  width: typeof window !== "undefined" ? window.innerWidth : 1920,
  height: typeof window !== "undefined" ? window.innerHeight : 1080,
  reducedFx: false,
};

let lastProgress = 0;

export function updateScrollProgress(next: number) {
  const delta = next - lastProgress;
  lastProgress = next;
  scrollState.velocity = Math.min(1, Math.max(-1, delta * 8));
  scrollState.progress = next;
}

export function decayVelocity() {
  scrollState.velocity *= 0.9;
}
