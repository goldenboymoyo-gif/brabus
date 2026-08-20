"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";

/**
 * Car launch stage environment — polished reflective floor, raised podium,
 * edge lighting strips, and gentle fog that clears during the reveal.
 * The whole look evokes a real auto-show unveiling.
 */
export default function Environment() {
  const choreo = useChoreography();
  const fog = useRef<THREE.FogExp2>(null);

  useFrame(() => {
    const s = choreo.current;
    if (fog.current) {
      // Much lighter fog — clears during reveal, stays subtle
      fog.current.density = 0.006 + s.fog * 0.025;
    }
  });

  return (
    <>
      <fogExp2 ref={fog} attach="fog" args={["#0a0a0e", 0.008]} />

      {/* ====== STAGE FLOOR — high-gloss reflective =================== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[28, 64]} />
        <meshStandardMaterial
          color="#141418"
          metalness={0.45}
          roughness={0.18}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* ====== RAISED PODIUM — circular stage platform ================ */}
      {/* Main podium disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <circleGeometry args={[3.8, 64]} />
        <meshStandardMaterial
          color="#1a1a20"
          metalness={0.5}
          roughness={0.15}
        />
      </mesh>
      {/* Podium edge ring — glowing accent */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0, 0]}>
        <ringGeometry args={[3.78, 3.86, 128]} />
        <meshBasicMaterial color="#c8c0b0" transparent opacity={0.35} />
      </mesh>
      {/* Inner accent ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[2.6, 2.64, 128]} />
        <meshBasicMaterial color="#a09888" transparent opacity={0.15} />
      </mesh>

      {/* ====== STAGE EDGE LIGHTS — LED strip effect =================== */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i * Math.PI * 2) / 8;
        const r = 3.82;
        return (
          <mesh
            key={`edge-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[Math.cos(angle) * r, 0.005, Math.sin(angle) * r]}
          >
            <boxGeometry args={[0.4, 0.02, 0.015]} />
            <meshBasicMaterial color="#e8e0d0" transparent opacity={0.2} />
          </mesh>
        );
      })}

      {/* ====== CONCENTRIC TURNTABLE RINGS ============================ */}
      {[1.8, 2.6, 3.8].map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.003 + i * 0.001, 0]}>
          <ringGeometry args={[r, r + 0.008, 128]} />
          <meshBasicMaterial color="#f4f3ef" transparent opacity={0.08} />
        </mesh>
      ))}

      {/* ====== BACKDROP — soft gradient wall ========================== */}
      <mesh position={[0, 5, -16]}>
        <planeGeometry args={[70, 25]} />
        <meshBasicMaterial color="#0e0e12" />
      </mesh>

      {/* ====== SIDE WALLS — subtle depth ============================= */}
      <mesh position={[-18, 4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshBasicMaterial color="#0c0c10" />
      </mesh>
      <mesh position={[18, 4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshBasicMaterial color="#0c0c10" />
      </mesh>
    </>
  );
}
