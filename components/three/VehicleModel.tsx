"use client";

import { Suspense, lazy } from "react";
import { MODEL_URL } from "@/lib/three/vehicleConfig";
import ProceduralVehicle from "./ProceduralVehicle";

const GLTFVehicle = lazy(() => import("./GLTFVehicle"));

/**
 * Modular vehicle loader. Renders the real GLTF model when MODEL_URL is
 * configured (lib/three/vehicleConfig.ts); otherwise falls back to — and by
 * default always uses — the procedural placeholder. This is the only file
 * that needs to know which one is active.
 */
export default function VehicleModel() {
  if (MODEL_URL) {
    return (
      <Suspense fallback={<ProceduralVehicle />}>
        <GLTFVehicle url={MODEL_URL} />
      </Suspense>
    );
  }
  return <ProceduralVehicle />;
}
