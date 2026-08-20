"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";
import { engineState } from "@/lib/three/sharedState";

/* ========================================================================
 * Studio + Interior Lighting Rig
 * ---------------------------------------------------------------------------
 * Positions calibrated to meter-scale GLB coordinates:
 *   Steering wheel: (0.41, 1.25, 0.36)
 *   Dashboard:      (~0, 1.1, 0.45)
 *   Gauges:         (0.43, 1.33, 0.63)
 *   Driver seat:    (0.41, 1.22, -0.13)
 *   Passenger seat: (-0.42, 1.21, -0.13)
 *   FL door: (0.75, 1.11, 0.35)   FR door: (-0.75, 1.10, 0.35)
 *   Rear seats: (-0.005, 1.03, -0.87)
 *   Headlights:     (~±0.62, 0.78, 2.05)
 * ======================================================================== */
export default function Lighting() {
  const choreo = useChoreography();

  const headlightL = useRef<THREE.SpotLight>(null);
  const headlightR = useRef<THREE.SpotLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const wheelLight = useRef<THREE.PointLight>(null);

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
    const isEngineOn = engineState.current;
    const baseHl = isEngineOn ? 3.5 : 1.0;

    // Exterior headlights — spotlights that project forward
    const hlIntensity = baseHl + s.headlight * 3.0;
    if (headlightL.current) headlightL.current.intensity = hlIntensity;
    if (headlightR.current) headlightR.current.intensity = hlIntensity;
    if (key.current) key.current.intensity = 1.35 + (1 - s.fog) * 0.6;
    if (wheelLight.current) wheelLight.current.intensity = s.wheelFocus * 2.6;

    // Interior
    const i = s.interiorFocus;
    if (intOverhead.current) intOverhead.current.intensity = i * 8;
    if (intFillFront.current) intFillFront.current.intensity = i * 5;
    if (intFillDriver.current) intFillDriver.current.intensity = i * 4;
    if (intFillPassenger.current) intFillPassenger.current.intensity = i * 3;
    if (intFillRear.current) intFillRear.current.intensity = i * 2.5;
    if (intScreenGlow.current) intScreenGlow.current.intensity = i * 6;
    if (intClusterGlow.current) intClusterGlow.current.intensity = i * 5;
    if (intConsoleGlow.current) intConsoleGlow.current.intensity = i * 3;
    if (intDoorAmbient.current) intDoorAmbient.current.intensity = i * 2.5 + Math.sin(Date.now() * 0.002) * 0.4;
    if (intDashAccent.current) intDashAccent.current.intensity = i * 3.5;
  });

  return (
    <>
      <ambientLight intensity={0.08} />

      {/* EXTERIOR STUDIO */}
      <directionalLight ref={key} position={[6, 8, 4]} intensity={1.4} color="#f4f3ef"
        castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-near={0.5} shadow-camera-far={30}
        shadow-camera-left={-6} shadow-camera-right={6}
        shadow-camera-top={6} shadow-camera-bottom={-6} shadow-bias={-0.002} />
      <directionalLight position={[-8, 3, -6]} intensity={0.5} color="#8fa3b0" />
      <directionalLight position={[0, 4, -8]} intensity={0.9} color="#ffffff" />

      {/* HEADLIGHT SPOTS — project forward from the car's front */}
      <spotLight ref={headlightL} position={[-0.62, 0.78, 2.05]}
        target-position={[-0.4, 0.5, 8]} angle={0.4} penumbra={0.5}
        distance={14} decay={2} color="#eaf3ff" intensity={3.5} />
      <spotLight ref={headlightR} position={[0.62, 0.78, 2.05]}
        target-position={[0.4, 0.5, 8]} angle={0.4} penumbra={0.5}
        distance={14} decay={2} color="#eaf3ff" intensity={3.5} />

      {/* WHEEL SCENE ACCENT */}
      <pointLight ref={wheelLight} position={[2.6, 1.6, 1.2]} distance={6} decay={2} color="#f4f3ef" intensity={0} />

      {/* INTERIOR LIGHTING — positioned for real G900 cabin (meter scale) */}

      {/* Overhead dome — cabin ceiling center */}
      <pointLight ref={intOverhead} position={[0, 1.55, -0.1]} distance={2.5} decay={2} color="#f0e8d8" intensity={0} />
      {/* Front fill — windshield */}
      <pointLight ref={intFillFront} position={[0, 1.35, 0.5]} distance={2.5} decay={2} color="#d8e4f0" intensity={0} />
      {/* Driver side — steering wheel & cluster */}
      <pointLight ref={intFillDriver} position={[0.35, 1.15, 0.2]} distance={1.8} decay={2} color="#f0e0c8" intensity={0} />
      {/* Passenger side */}
      <pointLight ref={intFillPassenger} position={[-0.35, 1.15, 0.2]} distance={1.8} decay={2} color="#e8e0d4" intensity={0} />
      {/* Rear fill */}
      <pointLight ref={intFillRear} position={[0, 1.0, -0.6]} distance={2} decay={2} color="#e0d8d0" intensity={0} />
      {/* Infotainment screen — center dash */}
      <pointLight ref={intScreenGlow} position={[0, 1.15, 0.55]} distance={1.5} decay={2} color="#a0c0e0" intensity={0} />
      {/* Instrument cluster — driver side */}
      <pointLight ref={intClusterGlow} position={[0.38, 1.25, 0.55]} distance={1.2} decay={2} color="#c0d4f0" intensity={0} />
      {/* Center console — shifter area */}
      <pointLight ref={intConsoleGlow} position={[0, 0.85, 0.1]} distance={1.2} decay={2} color="#ffe8cc" intensity={0} />
      {/* Door ambient — driver door panel */}
      <pointLight ref={intDoorAmbient} position={[0.7, 1.0, 0.15]} distance={1.5} decay={2} color="#ff8833" intensity={0} />
      {/* Dashboard accent */}
      <pointLight ref={intDashAccent} position={[0, 1.2, 0.45]} distance={2} decay={2} color="#f4ece0" intensity={0} />
    </>
  );
}
