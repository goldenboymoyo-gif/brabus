"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";
import { localProgress } from "@/lib/constants/scroll";
import { scrollState } from "@/lib/three/scrollState";

const DUST_COUNT = 200;
const STAR_COUNT = 600;

/**
 * Two-layer particle system:
 * 1. STARFIELD — distant, slow-moving stars always visible in the background.
 *    Gives the dark studio sky a cinematic depth.
 * 2. DUST / SPEED STREAKS — ambient dust in most scenes, stretches into fast
 *    horizontal speed-streaks during the Power scene.
 */
export default function Particles() {
  const choreo = useChoreography();
  const dustPoints = useRef<THREE.Points>(null);
  const starPoints = useRef<THREE.Points>(null);
  const dustMat = useRef<THREE.PointsMaterial>(null);
  const starMat = useRef<THREE.PointsMaterial>(null);

  // ---- Starfield ----
  const starPositions = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 15 + Math.random() * 30;
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.6 + 2;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, []);

  // ---- Dust / speed streaks ----
  const [dustPositions, dustSeeds] = useMemo(() => {
    const pos = new Float32Array(DUST_COUNT * 3);
    const seed = new Float32Array(DUST_COUNT);
    for (let i = 0; i < DUST_COUNT; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      seed[i] = Math.random();
    }
    return [pos, seed];
  }, []);

  useFrame((_, delta) => {
    const s = choreo.current;
    const powerAmt = localProgress(scrollState.progress, "power");
    const time = Date.now() * 0.0001;

    // ---- Animate stars — slow drift ----
    if (starPoints.current) {
      const geo = starPoints.current.geometry as THREE.BufferGeometry;
      const arr = geo.attributes.position.array as Float32Array;
      for (let i = 0; i < STAR_COUNT; i++) {
        const idx = i * 3;
        arr[idx] += Math.sin(time + i * 0.3) * 0.0003;
        arr[idx + 1] += Math.cos(time + i * 0.2) * 0.0002;
      }
      geo.attributes.position.needsUpdate = true;
    }

    // ---- Animate dust ----
    if (dustPoints.current) {
      const geo = dustPoints.current.geometry as THREE.BufferGeometry;
      const arr = geo.attributes.position.array as Float32Array;
      const speed = 0.4 + powerAmt * 12;
      for (let i = 0; i < DUST_COUNT; i++) {
        const idx = i * 3;
        arr[idx + 2] += delta * speed * (0.4 + dustSeeds[i]);
        if (arr[idx + 2] > 7) {
          arr[idx + 2] = -7;
          arr[idx] = (Math.random() - 0.5) * 14;
          arr[idx + 1] = Math.random() * 4;
        }
      }
      geo.attributes.position.needsUpdate = true;
    }

    // Dust material — fade with scene
    if (dustMat.current) {
      dustMat.current.opacity = THREE.MathUtils.lerp(
        dustMat.current.opacity,
        0.08 + powerAmt * 0.6 + s.headlight * 0.08,
        0.08
      );
      dustMat.current.size = 0.015 + powerAmt * 0.06;
    }

    // Star material — always visible, subtle fade with fog
    if (starMat.current) {
      starMat.current.opacity = THREE.MathUtils.lerp(
        starMat.current.opacity,
        0.35 + s.fog * 0.25 - s.interiorFocus * 0.2,
        0.05
      );
      // Twinkle via size oscillation
      starMat.current.size = 0.035 + Math.sin(time * 6) * 0.008;
    }
  });

  return (
    <>
      {/* ---- STARFIELD LAYER ---- */}
      <points ref={starPoints}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={STAR_COUNT}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={starMat}
          color="#f4f3ef"
          size={0.04}
          transparent
          opacity={0.4}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* ---- DUST / SPEED STREAKS LAYER ---- */}
      <points ref={dustPoints}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={DUST_COUNT}
            array={dustPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={dustMat}
          color="#f4f3ef"
          size={0.018}
          transparent
          opacity={0.1}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  );
}
