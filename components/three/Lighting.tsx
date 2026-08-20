"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";

/* ========================================================================
 * Studio + Interior Lighting Rig
 * ---------------------------------------------------------------------------
 * Exterior: dark studio with hard key, cool rim, weak fill, headlights.
 * Interior: cinematic multi-source — overhead soft, ambient strips, screen
 * glow contribution, side fills — all driven by interiorFocus.
 * ======================================================================== */
export default function Lighting() {
  const choreo = useChoreography();

  // Exterior refs
  const headlightL = useRef<THREE.PointLight>(null);
  const headlightR = useRef<THREE.PointLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const wheelLight = useRef<THREE.PointLight>(null);

  // Interior refs
  const intOverhead = useRef<THREE.PointLight>(null);
  const intFillFront = useRef<THREE.PointLight>(null);
  const intFillSide = useRef<THREE.PointLight>(null);
  const intFillRear = useRef<THREE.PointLight>(null);
  const intScreenGlow = useRef<THREE.PointLight>(null);
  const intAmbientWarm = useRef<THREE.RectAreaLight | any>(null);
  const intAmbientBlue = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const s = choreo.current;

    // --- Exterior ---
    const headlightIntensity = 1.0 + s.headlight * 3.2;
    if (headlightL.current) headlightL.current.intensity = headlightIntensity;
    if (headlightR.current) headlightR.current.intensity = headlightIntensity;
    if (key.current) key.current.intensity = 1.35 + (1 - s.fog) * 0.6;
    if (wheelLight.current) wheelLight.current.intensity = s.wheelFocus * 2.6;

    // --- Interior ---
    const i = s.interiorFocus;
    // Main overhead — soft warm white, positioned inside the cabin
    if (intOverhead.current) intOverhead.current.intensity = i * 6;
    // Front fill — slightly cool, simulates windshield light
    if (intFillFront.current) intFillFront.current.intensity = i * 4.5;
    // Side fill — warms the seats
    if (intFillSide.current) intFillSide.current.intensity = i * 3.5;
    // Rear fill — subtle, lifts shadows behind seats
    if (intFillRear.current) intFillRear.current.intensity = i * 2.5;
    // Screen glow — localized near dashboard screens
    if (intScreenGlow.current) intScreenGlow.current.intensity = i * 3;
    // Ambient warm — subtle overall warm tint
    if (intAmbientBlue.current) intAmbientBlue.current.intensity = i * 1.5;
  });

  return (
    <>
      {/* ======== AMBIENT FILL ====================================== */}
      <ambientLight intensity={0.1} />

      {/* ======== EXTERIOR STUDIO =================================== */}
      {/* Key light — warm directional */}
      <directionalLight
        ref={key}
        position={[6, 8, 4]}
        intensity={1.4}
        color="#f4f3ef"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.002}
      />
      {/* Rim light — cool, carves silhouette */}
      <directionalLight
        position={[-8, 3, -6]}
        intensity={0.5}
        color="#8fa3b0"
      />
      {/* Back fill — ensures rear isn't crushed to black */}
      <directionalLight
        position={[0, 4, -8]}
        intensity={0.9}
        color="#ffffff"
      />

      {/* ======== HEADLIGHTS ========================================= */}
      <pointLight
        ref={headlightL}
        position={[-0.62, 0.78, 2.05]}
        distance={7}
        decay={2}
        color="#eaf3ff"
        intensity={1.2}
      />
      <pointLight
        ref={headlightR}
        position={[0.62, 0.78, 2.05]}
        distance={7}
        decay={2}
        color="#eaf3ff"
        intensity={1.2}
      />

      {/* ======== WHEEL SCENE ACCENT ================================= */}
      <pointLight
        ref={wheelLight}
        position={[2.6, 1.6, 1.2]}
        distance={6}
        decay={2}
        color="#f4f3ef"
        intensity={0}
      />

      {/* ======== INTERIOR LIGHTING RIG ============================= */}
      {/*
        All interior lights live inside the cabin coordinate space
        (group is at [0, 0.55, -0.4]). Positions below are world-space
        offsets from that origin so they sit realistically within the cockpit.
      */}

      {/* Overhead dome light — soft warm white, centered in cabin ceiling */}
      <pointLight
        ref={intOverhead}
        position={[0, 1.6, -0.25]}
        distance={4}
        decay={2}
        color="#f0e8d8"
        intensity={0}
      />

      {/* Front fill — positioned at windshield height, cool tone simulating daylight through glass */}
      <pointLight
        ref={intFillFront}
        position={[0, 1.1, 0.7]}
        distance={3.5}
        decay={2}
        color="#d8e4f0"
        intensity={0}
      />

      {/* Side fill — driver side, warm, lights up seats and door panels */}
      <pointLight
        ref={intFillSide}
        position={[-1.4, 0.85, 0]}
        distance={3}
        decay={2}
        color="#f0e0c8"
        intensity={0}
      />

      {/* Rear fill — subtle, lifts the area behind seats */}
      <pointLight
        ref={intFillRear}
        position={[0, 0.8, -1.3]}
        distance={3}
        decay={2}
        color="#e0d8d0"
        intensity={0}
      />

      {/* Screen glow — localized near dashboard, cool blue tint */}
      <pointLight
        ref={intScreenGlow}
        position={[0, 0.75, -0.7]}
        distance={2}
        decay={2}
        color="#a0c0e0"
        intensity={0}
      />

      {/* Warm ambient accent — near door ambient strips */}
      <pointLight
        ref={intAmbientBlue as any}
        position={[-0.6, 0.5, -0.3]}
        distance={2}
        decay={2}
        color="#ff8833"
        intensity={0}
      />
    </>
  );
}
