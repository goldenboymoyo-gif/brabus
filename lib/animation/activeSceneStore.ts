"use client";

// ============================================================================
// Minimal external store for "which scene is active right now" — consumed by
// the sidebar, right-hand progress rail, and top nav so they all agree
// without prop drilling. Updated by the master ScrollTrigger driver.
// ============================================================================

import { useSyncExternalStore } from "react";

let activeIndex = 0;
const listeners = new Set<() => void>();

export function setActiveSceneIndex(index: number) {
  if (index === activeIndex) return;
  activeIndex = index;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return activeIndex;
}

export function useActiveSceneIndex(): number {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}
