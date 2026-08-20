// ============================================================================
// MODEL SWAP POINT
// ----------------------------------------------------------------------------
// This project ships with a procedural placeholder vehicle (see
// components/three/ProceduralVehicle.tsx) so the entire scroll/camera/
// lighting architecture works out of the box with zero external assets.
//
// To use a real GLTF/GLB vehicle model:
//   1. Drop the optimized .glb file into /public/models/ (DRACO-compressed
//      recommended — see the draco loader already wired in GLTFVehicle.tsx).
//   2. Set MODEL_URL below to its public path, e.g. "/models/qwagon.glb".
//   3. components/three/VehicleModel.tsx will automatically switch from the
//      procedural placeholder to the real model — no other code changes
//      required. Optionally tune MODEL_SCALE / MODEL_Y_OFFSET / MODEL_ROTATION_Y
//      below to align the real mesh's origin with the camera path defined in
//      lib/three/cameraPath.ts (which assumes the car is centered at the
//      origin, facing +Z).
// ============================================================================

export const MODEL_URL: string | null = null;

// Scale: Sketchfab models are usually in real-world meters (~4.8m long G-Class).
// The camera path expects the car ~4.35 units long, centered at origin.
// Tune these after first render — the model may need re-scaling.
export const MODEL_SCALE = 0.9;
export const MODEL_Y_OFFSET = 0;
export const MODEL_ROTATION_Y = 0;
