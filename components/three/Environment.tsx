"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";

/**
 * Dark studio floor + backdrop. No HDR environment map dependency — the
 * whole look is built from a reflective ground plane, a soft vertical
 * backdrop gradient, and scroll-driven exponential fog for depth and mood.
 */
export default function Environment() {
  const choreo = useChoreography();
  const fog = useRef<THREE.FogExp2>(null);

  useFrame(() => {
    const s = choreo.current;
    if (fog.current) {
      fog.current.density = 0.018 + s.fog * 0.09;
    }
  });

  return (
    <>
      <fogExp2 ref={fog} attach="fog" args={["#000000", 0.02]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[24, 64]} />
        <meshStandardMaterial
          color="#060606"
          metalness={0.25}
          roughness={0.72}
        />
      </mesh>

      {/* Subtle concentric turntable rings, echoing the wireframe's studio disc */}
      {[3.2, 4.4, 5.6].map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015 + i * 0.001, 0]}>
          <ringGeometry args={[r, r + 0.012, 128]} />
          <meshBasicMaterial color="#f4f3ef" transparent opacity={0.06} />
        </mesh>
      ))}

      {/* Backdrop */}
      <mesh position={[0, 6, -14]}>
        <planeGeometry args={[60, 30]} />
        <meshBasicMaterial color="#020202" />
      </mesh>
    </>
  );
}
