"use client";

import { createContext, useContext, useRef, type ReactNode, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { sampleCameraPath } from "@/lib/three/cameraPath";
import { scrollState } from "@/lib/three/scrollState";

export type ChoreographySample = ReturnType<typeof sampleCameraPath>;

const ChoreographyContext = createContext<MutableRefObject<ChoreographySample> | null>(null);

/**
 * Single source of truth for every scroll-driven 3D value this frame.
 * Runs first (priority -100) so all children read a consistent sample.
 */
export function ChoreographyProvider({ children }: { children: ReactNode }) {
  const ref = useRef<ChoreographySample>(sampleCameraPath(0));
  useFrame(() => {
    ref.current = sampleCameraPath(scrollState.progress);
  }, -100);

  return (
    <ChoreographyContext.Provider value={ref}>{children}</ChoreographyContext.Provider>
  );
}

export function useChoreography() {
  const ctx = useContext(ChoreographyContext);
  if (!ctx) {
    throw new Error("useChoreography must be used within <ChoreographyProvider>");
  }
  return ctx;
}
