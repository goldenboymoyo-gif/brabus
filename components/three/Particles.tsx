"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";
import { localProgress } from "@/lib/constants/scroll";
import { scrollState } from "@/lib/three/scrollState";

const COUNT = 260;

/**
 * Ambient dust in most scenes; stretches into fast horizontal speed-streaks
 * during the Power scene to sell acceleration without a full post-process
 * motion-blur pass (kept GPU-cheap: a single Points draw call).
 */
export default function Particles() {
  const choreo = useChoreography();
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);

  const [positions, seeds] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      seed[i] = Math.random();
    }
    return [pos, seed];
  }, []);

  useFrame((_, delta) => {
    if (!points.current) return;
    const s = choreo.current;
    const powerAmt = localProgress(scrollState.progress, "power");
    const speed = 0.4 + powerAmt * 9;
    const geo = points.current.geometry as THREE.BufferGeometry;
    const arr = geo.attributes.position.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      const idx = i * 3;
      arr[idx + 2] += delta * speed * (0.4 + seeds[i]);
      if (arr[idx + 2] > 7) {
        arr[idx + 2] = -7;
        arr[idx] = (Math.random() - 0.5) * 14;
        arr[idx + 1] = Math.random() * 4;
      }
    }
    geo.attributes.position.needsUpdate = true;

    if (material.current) {
      material.current.opacity = THREE.MathUtils.lerp(
        material.current.opacity,
        0.12 + powerAmt * 0.55 + s.headlight * 0.05,
        0.08
      );
      material.current.size = 0.012 + powerAmt * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        color="#f4f3ef"
        size={0.02}
        transparent
        opacity={0.15}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
