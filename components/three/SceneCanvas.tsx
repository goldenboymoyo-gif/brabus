"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { ChoreographyProvider } from "@/lib/three/choreography";
import CameraRig from "./CameraRig";
import Lighting from "./Lighting";
import Environment from "./Environment";
import Particles from "./Particles";
import VehicleModel from "./VehicleModel";
import WheelAssembly from "./WheelAssembly";
import CarbonSurface from "./CarbonSurface";
import InteriorCabin from "./InteriorCabin";
import CarCover from "./CarCover";
import InteriorSound from "./InteriorSound";
import ScrollSound from "./ScrollSound";
import MirrorReflection from "./MirrorReflection";

/**
 * The single persistent, fixed-position R3F canvas behind every scene.
 * Scroll never remounts it — only the choreography sample changes — which
 * is what makes the scene-to-scene motion read as one continuous film
 * instead of nine separate embeds.
 */
export default function SceneCanvas() {
  const [dpr, setDpr] = useState(1.5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={dpr}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
        camera={{ position: [0, 1.1, 9.5], fov: 32, near: 0.1, far: 60 }}
        shadows
      >
        <color attach="background" args={["#000000"]} />
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
        <ChoreographyProvider>
          <Suspense fallback={null}>
            <Lighting />
            <Environment />
            <Particles />
            <VehicleModel />
            <CarCover />
            <WheelAssembly />
            <CarbonSurface />
            <InteriorCabin />
            <InteriorSound />
            <ScrollSound />
            <MirrorReflection />
          </Suspense>
          <CameraRig />
        </ChoreographyProvider>
      </Canvas>
    </div>
  );
}
