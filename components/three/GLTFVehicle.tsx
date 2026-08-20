"use client";

import { useEffect, useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { MODEL_SCALE, MODEL_Y_OFFSET, MODEL_ROTATION_Y } from "@/lib/three/vehicleConfig";
import { useChoreography } from "@/lib/three/choreography";
import { useFrame } from "@react-three/fiber";

/**
 * Renders a real GLTF/GLB vehicle once MODEL_URL is set in vehicleConfig.ts.
 * Applies the same scroll-driven body opacity as the procedural placeholder
 * so swapping the model preserves the Carbon/Wheels/Interior focus pulls.
 */
export default function GLTFVehicle({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => {
    const s = gltf.scene.clone(true);

    s.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Clone materials so opacity changes don't conflict across refs
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => {
            const cloned = m.clone();
            (cloned as any).transparent = true;
            (cloned as any).depthWrite = true;
            return cloned;
          });
        } else {
          const cloned = (mesh.material as THREE.Material).clone();
          (cloned as any).transparent = true;
          (cloned as any).depthWrite = true;
          mesh.material = cloned;
        }
      }
    });

    return s;
  }, [gltf]);

  const group = useRef<THREE.Group>(null);
  const choreo = useChoreography();
  const materials = useRef<THREE.Material[]>([]);

  useEffect(() => {
    const mats: THREE.Material[] = [];
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mat = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mats.push(...mat);
        else mats.push(mat);
      }
    });
    materials.current = mats;
  }, [scene]);

  useFrame(() => {
    const opacity = choreo.current.bodyOpacity;
    materials.current.forEach((m) => {
      const mm = m as THREE.MeshStandardMaterial;
      mm.transparent = opacity < 0.98;
      mm.opacity = opacity;
      mm.depthWrite = opacity > 0.5;
    });
  });

  return (
    <primitive
      ref={group}
      object={scene}
      scale={MODEL_SCALE}
      position={[0, MODEL_Y_OFFSET, 0]}
      rotation={[0, MODEL_ROTATION_Y, 0]}
    />
  );
}
