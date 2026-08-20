"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";
import { localProgress } from "@/lib/constants/scroll";
import { scrollState } from "@/lib/three/scrollState";

/**
 * Silk cover draped over the car during the reveal scene.
 * Pulls upward and fades out as the user scrolls through Scene 01,
 * like a real auto-show unveiling where the cloth is pulled off.
 */
export default function CarCover() {
  const choreo = useChoreography();
  const group = useRef<THREE.Group>(null);
  const clothRef = useRef<THREE.Mesh>(null);

  const clothMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#d8d0c4",
      metalness: 0.05,
      roughness: 0.75,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
  }, []);

  // Create draped cloth geometry — a deformed plane that sags in the middle
  const clothGeo = useMemo(() => {
    const segments = 32;
    const geo = new THREE.PlaneGeometry(2.8, 5.2, segments, segments);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i); // PlaneGeometry Y maps to world Z
      // Drape sag — center sags down, edges stay up
      const sagX = 1 - (x / 1.4) * (x / 1.4);
      const sagZ = 1 - (z / 2.6) * (z / 2.6);
      const sag = sagX * sagZ * 0.25;
      pos.setZ(i, -sag);
      // Wrinkle along edges
      const edgeDist = Math.max(Math.abs(x) - 1.0, 0) / 0.4;
      pos.setZ(i, pos.getZ(i) - edgeDist * 0.08 * Math.sin(z * 8));
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame(() => {
    const local = localProgress(scrollState.progress, "reveal");
    const s = choreo.current;

    if (group.current) {
      // Cover is visible only during reveal scene
      const coverVisible = local < 1.0 && s.bodyOpacity > 0.5;
      group.current.visible = coverVisible;

      if (coverVisible) {
        // Pull up: cover lifts off the car as you scroll
        const liftProgress = Math.min(1, local * 1.4); // finishes before scene ends
        const liftY = liftProgress * 3.5;
        const liftScale = 1 + liftProgress * 0.3;

        group.current.position.y = 0.55 + liftY;
        group.current.scale.set(liftScale, 1 + liftProgress * 0.5, liftScale);

        // Fade out as it lifts
        clothMat.opacity = Math.max(0, 1 - liftProgress * 1.2);

        // Slight rotation for dramatic effect
        group.current.rotation.y = liftProgress * 0.15;
      }
    }

    // Hide once body fades for interior
    if (group.current && s.bodyOpacity < 0.5) {
      group.current.visible = false;
    }
  });

  return (
    <group ref={group} position={[0, 0.55, 0]}>
      <mesh
        ref={clothRef}
        geometry={clothGeo}
        material={clothMat}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.9, -0.2]}
        castShadow
      />
    </group>
  );
}
