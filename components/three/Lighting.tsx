"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";

/* ========================================================================
 * Studio + Interior Lighting Rig
 * ---------------------------------------------------------------------------
 * Exterior: dark studio with hard key, cool rim, weak fill, headlights.
 * Interior: cinematic multi-source lighting designed for the real G900
 * cabin geometry — positioned to illuminate the actual dashboard, seats,
 * door panels, and center console from the GLB model.
 * ======================================================================== */
export default function Lighting() {
  const choreo = useChoreography();

  // Exterior refs
  const headlightL = useRef<THREE.PointLight>(null);
  const headlightR = useRef<THREE.PointLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const wheelLight = useRef<THREE.PointLight>(null);

  // Interior refs — positioned for the real G900 cabin
  const intOverhead = useRef<THREE.PointLight>(null);
  const intFillFront = useRef<THREE.PointLight>(null);
  const intFillDriver = useRef<THREE.PointLight>(null);
  const intFillPassenger = useRef<THREE.PointLight>(null);
  const intFillRear = useRef<THREE.PointLight>(null);
  const intScreenGlow = useRef<THREE.PointLight>(null);
  const intClusterGlow = useRef<THREE.PointLight>(null);
  const intConsoleGlow = useRef<THREE.PointLight>(null);
  const intDoorAmbient = useRef<THREE.PointLight>(null);
  const intDashAccent = useRef<THREE.PointLight>(null);

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

    // Main overhead — soft warm white, dome light position in cabin ceiling
    if (intOverhead.current) intOverhead.current.intensity = i * 8;

    // Front fill — windshield daylight, cool tone
    if (intFillFront.current) intFillFront.current.intensity = i * 5;

    // Driver side fill — warm, illuminates steering wheel and cluster
    if (intFillDriver.current) intFillDriver.current.intensity = i * 4;

    // Passenger side fill — softer, balances the cabin
    if (intFillPassenger.current) intFillPassenger.current.intensity = i * 3;

    // Rear fill — lifts area behind front seats
    if (intFillRear.current) intFillRear.current.intensity = i * 2.5;

    // Infotainment screen glow — cool blue-white
    if (intScreenGlow.current) intScreenGlow.current.intensity = i * 6;

    // Instrument cluster glow — driver side
    if (intClusterGlow.current) intClusterGlow.current.intensity = i * 5;

    // Center console — warm accent
    if (intConsoleGlow.current) intConsoleGlow.current.intensity = i * 3;

    // Door ambient strips — subtle warm glow on door panels
    if (intDoorAmbient.current) intDoorAmbient.current.intensity = i * 2.5 + Math.sin(Date.now() * 0.002) * 0.4;

    // Dashboard accent — subtle wash across the dash surface
    if (intDashAccent.current) intDashAccent.current.intensity = i * 3.5;
  });

  return (
    <>
      {/* ======== AMBIENT FILL ====================================== */}
      <ambientLight intensity={0.08} />

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
        Positions calibrated for the real G900 cabin geometry from the GLB.
        Model is at scale 0.9, centered at origin, facing +Z.
        Driver's seat is at approximately -X, passenger at +X.
        Dashboard is toward +Z (front of vehicle).
      */}

      {/* Overhead dome — centered in cabin ceiling */}
      <pointLight
        ref={intOverhead}
        position={[0, 1.55, -0.1]}
        distance={4.5}
        decay={2}
        color="#f0e8d8"
        intensity={0}
      />

      {/* Front fill — windshield height, cool daylight tone */}
      <pointLight
        ref={intFillFront}
        position={[0, 1.25, 0.5]}
        distance={4}
        decay={2}
        color="#d8e4f0"
        intensity={0}
      />

      {/* Driver side fill — illuminates steering wheel, cluster, pedals */}
      <pointLight
        ref={intFillDriver}
        position={[-0.5, 1.05, -0.2]}
        distance={2.5}
        decay={2}
        color="#f0e0c8"
        intensity={0}
      />

      {/* Passenger side fill — balances cabin lighting */}
      <pointLight
        ref={intFillPassenger}
        position={[0.5, 1.05, -0.2]}
        distance={2.5}
        decay={2}
        color="#e8e0d4"
        intensity={0}
      />

      {/* Rear fill — lifts the area behind front seats */}
      <pointLight
        ref={intFillRear}
        position={[0, 0.9, -1.4]}
        distance={3}
        decay={2}
        color="#e0d8d0"
        intensity={0}
      />

      {/* Infotainment screen glow — cool blue-white, center dash */}
      <pointLight
        ref={intScreenGlow}
        position={[0.15, 1.05, 0.1]}
        distance={2.5}
        decay={2}
        color="#a0c0e0"
        intensity={0}
      />

      {/* Instrument cluster glow — driver side */}
      <pointLight
        ref={intClusterGlow}
        position={[-0.4, 1.1, -0.15]}
        distance={2}
        decay={2}
        color="#c0d4f0"
        intensity={0}
      />

      {/* Center console — warm accent near shifter */}
      <pointLight
        ref={intConsoleGlow}
        position={[0, 0.65, -0.1]}
        distance={1.8}
        decay={2}
        color="#ffe8cc"
        intensity={0}
      />

      {/* Door ambient — warm glow on driver door panel */}
      <pointLight
        ref={intDoorAmbient}
        position={[-1.0, 0.75, -0.1]}
        distance={2}
        decay={2}
        color="#ff8833"
        intensity={0}
      />

      {/* Dashboard accent — washes across dash surface */}
      <pointLight
        ref={intDashAccent}
        position={[0, 1.15, 0.3]}
        distance={3}
        decay={2}
        color="#f4ece0"
        intensity={0}
      />
    </>
  );
}
