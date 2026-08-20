"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { CubeCamera, WebGLCubeRenderTarget, RGBAFormat, LinearFilter } from "three";
import { useChoreography } from "@/lib/three/choreography";

/* ========================================================================
 * Side Mirror Reflections
 * ---------------------------------------------------------------------------
 * Uses a single shared CubeCamera that repositions to each mirror location
 * every other frame. Mirror meshes get an envMap from the cube render target.
 * Very low resolution (64px) for performance — just enough for a glossy
 * reflection hint.
 * ======================================================================== */

const MIRROR_SIZE = 64;

export default function MirrorReflection() {
  const choreo = useChoreography();
  const { scene, gl } = useThree();
  const frameCount = useRef(0);

  const rt = useMemo(() => new WebGLCubeRenderTarget(MIRROR_SIZE, {
    format: RGBAFormat,
    magFilter: LinearFilter,
    minFilter: LinearFilter,
  }), []);

  const cubeCamera = useMemo(() => new CubeCamera(0.1, 50, rt), [rt]);

  // Mirror positions in meter-scale GLB coordinates
  // Left mirror (driver side): ~(0.85, 1.15, 0.05)
  // Right mirror (passenger side): ~(~-0.85, 1.15, 0.05)
  const mirrors = useRef([
    { pos: [0.85, 1.15, 0.05] as [number, number, number], name: "mirror_L" },
    { pos: [-0.85, 1.15, 0.05] as [number, number, number], name: "mirror_R" },
  ]);

  useFrame(() => {
    frameCount.current++;
    // Update every 4th frame for performance
    if (frameCount.current % 4 !== 0) return;

    const s = choreo.current;
    // Only render mirrors when camera is reasonably close
    if (s.interiorFocus < 0.1 && s.bodyOpacity > 0.5) {
      const mirrorIdx = Math.floor((frameCount.current / 4) % 2);
      const m = mirrors.current[mirrorIdx];
      cubeCamera.position.set(...m.pos);
      cubeCamera.update(gl, scene);
    }
  });

  return null;
}

/**
 * Hook to apply mirror envMap to a mesh material.
 */
export function useMirrorEnv(rt: WebGLCubeRenderTarget | null) {
  const updateEnv = (material: { envMap: any; envMapIntensity: number; needsUpdate: boolean }) => {
    if (rt && !material.envMap) {
      material.envMap = rt.texture;
      material.envMapIntensity = 0.6;
      material.needsUpdate = true;
    }
  };

  return { updateEnv };
}
