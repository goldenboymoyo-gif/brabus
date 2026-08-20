"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { MODEL_SCALE, MODEL_Y_OFFSET, MODEL_ROTATION_Y } from "@/lib/three/vehicleConfig";
import { useChoreography } from "@/lib/three/choreography";
import { useFrame } from "@react-three/fiber";

/* ========================================================================
 * INTERIOR NODE NAME PATTERNS
 * These patterns identify which meshes belong to the cabin interior.
 * When interiorFocus > 0, these materials fade IN while exterior fades OUT.
 * ======================================================================== */
const INTERIOR_PATTERNS = [
  /interior/i,
  /interiordfs/i,
  /driver_seat/i,
  /passanger_seat/i,
  /passenger_seat/i,
  /rear_seat/i,
  /steeringwheel/i,
  /steering_wheel/i,
  /shifter/i,
  /gauges/i,
  /signal.*stalk/i,
  /seat_plastic/i,
  /seat.*leather/i,
  /leatherbmp/i,
  /ptn_leather/i,
  /setlogo/i,
  /roof_button/i,
  /belt_color/i,
  /AMG_dash/i,
  /brabus_dash/i,
  /dash_skin/i,
  /RGB_int/i,
  /door_red/i,
  /door_plastic/i,
  /red_int/i,
  /int_badge/i,
  /door.*panel/i,
  /FL_door/i,
  /FR_door/i,
  /RL_door/i,
  /RR_door/i,
  /temp_[0-9]/i,
  /needle/i,
];

function isInteriorMesh(nodeName: string): boolean {
  return INTERIOR_PATTERNS.some((p) => p.test(nodeName));
}

/**
 * Classifies all meshes in the scene into interior and exterior groups.
 * Returns cloned materials for each so opacity changes don't conflict.
 */
function classifyMeshes(scene: THREE.Object3D) {
  const exterior: THREE.Material[] = [];
  const interior: THREE.Material[] = [];
  const screenMeshes: THREE.Mesh[] = [];
  const ambientMeshes: THREE.Mesh[] = [];
  const redAccentMeshes: THREE.Mesh[] = [];

  scene.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    const name = obj.name || "";

    // Clone material
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((m) => {
        const cloned = m.clone();
        (cloned as any).transparent = true;
        (cloned as any).depthWrite = true;
        return cloned;
      });
    } else if (mesh.material) {
      const cloned = (mesh.material as THREE.Material).clone();
      (cloned as any).transparent = true;
      (cloned as any).depthWrite = true;
      mesh.material = cloned;
    }

    const mats = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    const isInt = isInteriorMesh(name);

    mats.forEach((m) => {
      if (isInt) {
        interior.push(m);
        // Track screen-like meshes (gauges, temp displays)
        if (/gauges|temp_|needle|AMG_gauges/i.test(name)) {
          screenMeshes.push(mesh);
        }
        // Track RGB_int ambient light geometry
        if (/RGB_int/i.test(name)) {
          ambientMeshes.push(mesh);
        }
        // Track red accent pieces
        if (/red_int|door_red|red_b|red$/i.test(name)) {
          redAccentMeshes.push(mesh);
        }
      } else {
        exterior.push(m);
      }
    });
  });

  return { exterior, interior, screenMeshes, ambientMeshes, redAccentMeshes };
}

/**
 * Enhanced GLTF Vehicle — renders brabus-g900.glb with dual material systems:
 * - Exterior materials: driven by bodyOpacity (fade out as camera enters cabin)
 * - Interior materials: driven by interiorFocus (fade in as camera enters cabin)
 * - Screen meshes: get emissive boost when interior is active
 * - Ambient/red accent meshes: get emissive glow when interior is active
 */
export default function GLTFVehicle({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const choreo = useChoreography();

  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);

  const exteriorMats = useRef<THREE.Material[]>([]);
  const interiorMats = useRef<THREE.Material[]>([]);
  const screenMats = useRef<THREE.Material[]>([]);
  const ambientMats = useRef<THREE.Material[]>([]);
  const redAccentMats = useRef<THREE.Material[]>([]);

  useEffect(() => {
    const classified = classifyMeshes(scene);
    exteriorMats.current = classified.exterior;
    interiorMats.current = classified.interior;
    // Collect unique materials from screen/ambient/red meshes
    const screens = new Set<THREE.Material>();
    const ambient = new Set<THREE.Material>();
    const reds = new Set<THREE.Material>();
    classified.screenMeshes.forEach((m) => {
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      mats.forEach((mat) => screens.add(mat as THREE.Material));
    });
    classified.ambientMeshes.forEach((m) => {
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      mats.forEach((mat) => ambient.add(mat as THREE.Material));
    });
    classified.redAccentMeshes.forEach((m) => {
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      mats.forEach((mat) => reds.add(mat as THREE.Material));
    });
    screenMats.current = [...screens];
    ambientMats.current = [...ambient];
    redAccentMats.current = [...reds];
  }, [scene]);

  useFrame(() => {
    const s = choreo.current;
    const bodyOp = s.bodyOpacity;
    const intFocus = s.interiorFocus;

    // Exterior — fades out as camera enters cabin
    exteriorMats.current.forEach((m) => {
      const mm = m as THREE.MeshStandardMaterial;
      mm.transparent = bodyOp < 0.98;
      mm.opacity = bodyOp;
      mm.depthWrite = bodyOp > 0.5;
    });

    // Interior — fades in as camera enters cabin
    interiorMats.current.forEach((m) => {
      const mm = m as THREE.MeshStandardMaterial;
      mm.transparent = true;
      mm.opacity = intFocus;
      mm.depthWrite = intFocus > 0.5;
      // Boost roughness slightly to reduce plastic look
      if (mm.roughness < 0.3 && mm.metalness < 0.1) {
        // Leather-like materials — warm up
      }
    });

    // Screen emissive — cluster and gauge displays glow when interior active
    screenMats.current.forEach((m) => {
      const mm = m as THREE.MeshStandardMaterial;
      if (mm.emissive) {
        mm.emissiveIntensity = 0.2 + intFocus * 3.5;
      }
    });

    // RGB_int ambient lighting geometry — warm amber glow
    ambientMats.current.forEach((m) => {
      const mm = m as THREE.MeshStandardMaterial;
      if (mm.emissive) {
        mm.emissiveIntensity = 0.5 + intFocus * 4.0 + Math.sin(Date.now() * 0.002) * 0.3;
      }
    });

    // Red accent pieces — subtle emissive warmth
    redAccentMats.current.forEach((m) => {
      const mm = m as THREE.MeshStandardMaterial;
      if (mm.emissive) {
        mm.emissiveIntensity = 0.1 + intFocus * 1.5;
      }
    });
  });

  return (
    <primitive
      object={scene}
      scale={MODEL_SCALE}
      position={[0, MODEL_Y_OFFSET, 0]}
      rotation={[0, MODEL_ROTATION_Y, 0]}
    />
  );
}
