"use client";

import { Suspense, lazy, Component, type ReactNode } from "react";
import { MODEL_URL } from "@/lib/three/vehicleConfig";
import ProceduralVehicle from "./ProceduralVehicle";

const GLTFVehicle = lazy(() => import("./GLTFVehicle"));

/**
 * Error boundary that catches GLTF loading failures and falls back
 * to the procedural vehicle instead of crashing the whole app.
 */
class GLTFErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

/**
 * Modular vehicle loader. Renders the real GLTF model when MODEL_URL is
 * configured; otherwise falls back to the procedural placeholder.
 */
export default function VehicleModel() {
  if (MODEL_URL) {
    return (
      <GLTFErrorBoundary fallback={<ProceduralVehicle />}>
        <Suspense fallback={<ProceduralVehicle />}>
          <GLTFVehicle url={MODEL_URL} />
        </Suspense>
      </GLTFErrorBoundary>
    );
  }
  return <ProceduralVehicle />;
}
