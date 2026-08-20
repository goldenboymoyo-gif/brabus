"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";
import { engineState } from "@/lib/three/sharedState";

/* ========================================================================
 * Car Launch Stage Lighting Rig
 * ---------------------------------------------------------------------------
 * Dramatic presentation lighting like a real auto show reveal:
 * - Overhead spot cones hitting the car from above
 * - Rim / edge lights for silhouette definition
 * - Warm fill to prevent pure-black dead zones
 * - Interior cabin lights fade in with interiorFocus
 * ======================================================================== */
export default function Lighting() {
  const choreo = useChoreography();

  const headlightL = useRef<THREE.SpotLight>(null);
  const headlightR = useRef<THREE.SpotLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const wheelLight = useRef<THREE.PointLight>(null);

  // Stage spots
  const stageSpotFront = useRef<THREE.SpotLight>(null);
  const stageSpotLeft = useRef<THREE.SpotLight>(null);
  const stageSpotRight = useRef<THREE.SpotLight>(null);
  const stageSpotRear = useRef<THREE.SpotLight>(null);
  const rimLightL = useRef<THREE.PointLight>(null);
  const rimLightR = useRef<THREE.PointLight>(null);

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
    const baseHl = isEngineOn ? 4.0 : 1.5;

    // Exterior headlights
    const hlIntensity = baseHl + s.headlight * 4.0;
    if (headlightL.current) headlightL.current.intensity = hlIntensity;
    if (headlightR.current) headlightR.current.intensity = hlIntensity;
    if (key.current) key.current.intensity = 2.0 + (1 - s.fog) * 1.2;
    if (wheelLight.current) wheelLight.current.intensity = s.wheelFocus * 3.5;

    // Stage spots — fade in as fog clears (reveal progression)
    const stageReveal = THREE.MathUtils.clamp(1 - s.fog, 0, 1);
    if (stageSpotFront.current) stageSpotFront.current.intensity = stageReveal * 12;
    if (stageSpotLeft.current) stageSpotLeft.current.intensity = stageReveal * 8;
    if (stageSpotRight.current) stageSpotRight.current.intensity = stageReveal * 8;
    if (stageSpotRear.current) stageSpotRear.current.intensity = stageReveal * 6;
    if (rimLightL.current) rimLightL.current.intensity = stageReveal * 3;
    if (rimLightR.current) rimLightR.current.intensity = stageReveal * 3;

    // Interior
    const i = s.interiorFocus;
    if (intOverhead.current) intOverhead.current.intensity = i * 10;
    if (intFillFront.current) intFillFront.current.intensity = i * 7;
    if (intFillDriver.current) intFillDriver.current.intensity = i * 5;
    if (intFillPassenger.current) intFillPassenger.current.intensity = i * 4;
    if (intFillRear.current) intFillRear.current.intensity = i * 3.5;
    if (intScreenGlow.current) intScreenGlow.current.intensity = i * 8;
    if (intClusterGlow.current) intClusterGlow.current.intensity = i * 7;
    if (intConsoleGlow.current) intConsoleGlow.current.intensity = i * 4;
    if (intDoorAmbient.current) intDoorAmbient.current.intensity = i * 3.5 + Math.sin(Date.now() * 0.002) * 0.5;
    if (intDashAccent.current) intDashAccent.current.intensity = i * 5;
  });

  return (
    <>
      {/* AMBIENT — enough to see geometry, not wash out */}
      <ambientLight intensity={0.35} color="#e8e4e0" />

      {/* KEY LIGHT — main directional, slightly warm */}
      <directionalLight ref={key} position={[6, 10, 4]} intensity={2.2} color="#f4f3ef"
        castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-near={0.5} shadow-camera-far={30}
        shadow-camera-left={-6} shadow-camera-right={6}
        shadow-camera-top={6} shadow-camera-bottom={-6} shadow-bias={-0.002} />

      {/* FILL LIGHTS — prevent dead-black shadows */}
      <directionalLight position={[-6, 5, -4]} intensity={1.0} color="#c0c8d4" />
      <directionalLight position={[0, 6, -8]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[0, 3, 8]} intensity={0.8} color="#e0dcd4" />

      {/* HEADLIGHT SPOTS */}
      <spotLight ref={headlightL} position={[-0.62, 0.78, 2.05]}
        target-position={[-0.4, 0.5, 8]} angle={0.4} penumbra={0.5}
        distance={14} decay={2} color="#eaf3ff" intensity={4.0} />
      <spotLight ref={headlightR} position={[0.62, 0.78, 2.05]}
        target-position={[0.4, 0.5, 8]} angle={0.4} penumbra={0.5}
        distance={14} decay={2} color="#eaf3ff" intensity={4.0} />

      {/* ====== STAGE SPOTS — overhead cones like a car reveal ========= */}
      {/* Front spot — main hero cone from above-front */}
      <spotLight ref={stageSpotFront} position={[0, 6, 3]}
        target-position={[0, 0, 0]} angle={0.5} penumbra={0.6}
        distance={12} decay={1.5} color="#fff8f0" intensity={12} castShadow />

      {/* Left spot — cross-light for depth */}
      <spotLight ref={stageSpotLeft} position={[-4, 5, 0]}
        target-position={[0, 0, 0]} angle={0.45} penumbra={0.5}
        distance={10} decay={1.5} color="#f0f0ff" intensity={8} />

      {/* Right spot — cross-light opposite side */}
      <spotLight ref={stageSpotRight} position={[4, 5, 0]}
        target-position={[0, 0, 0]} angle={0.45} penumbra={0.5}
        distance={10} decay={1.5} color="#f0f0ff" intensity={8} />

      {/* Rear spot — backlight for silhouette edge */}
      <spotLight ref={stageSpotRear} position={[0, 5, -4]}
        target-position={[0, 0, 0]} angle={0.5} penumbra={0.6}
        distance={10} decay={1.5} color="#e0e4f0" intensity={6} />

      {/* RIM / EDGE LIGHTS — define the car's outline */}
      <pointLight ref={rimLightL} position={[-3, 1.5, 2]} distance={8} decay={2} color="#d0d4e0" intensity={3} />
      <pointLight ref={rimLightR} position={[3, 1.5, 2]} distance={8} decay={2} color="#d0d4e0" intensity={3} />

      {/* WHEEL SCENE ACCENT */}
      <pointLight ref={wheelLight} position={[2.6, 1.6, 1.2]} distance={6} decay={2} color="#f4f3ef" intensity={0} />

      {/* ====== INTERIOR LIGHTING ====================================== */}
      <pointLight ref={intOverhead} position={[0, 1.55, -0.1]} distance={2.5} decay={2} color="#f0e8d8" intensity={0} />
      <pointLight ref={intFillFront} position={[0, 1.35, 0.5]} distance={2.5} decay={2} color="#d8e4f0" intensity={0} />
      <pointLight ref={intFillDriver} position={[0.35, 1.15, 0.2]} distance={1.8} decay={2} color="#f0e0c8" intensity={0} />
      <pointLight ref={intFillPassenger} position={[-0.35, 1.15, 0.2]} distance={1.8} decay={2} color="#e8e0d4" intensity={0} />
      <pointLight ref={intFillRear} position={[0, 1.0, -0.6]} distance={2} decay={2} color="#e0d8d0" intensity={0} />
      <pointLight ref={intScreenGlow} position={[0, 1.15, 0.55]} distance={1.5} decay={2} color="#a0c0e0" intensity={0} />
      <pointLight ref={intClusterGlow} position={[0.38, 1.25, 0.55]} distance={1.2} decay={2} color="#c0d4f0" intensity={0} />
      <pointLight ref={intConsoleGlow} position={[0, 0.85, 0.1]} distance={1.2} decay={2} color="#ffe8cc" intensity={0} />
      <pointLight ref={intDoorAmbient} position={[0.7, 1.0, 0.15]} distance={1.5} decay={2} color="#ff8833" intensity={0} />
      <pointLight ref={intDashAccent} position={[0, 1.2, 0.45]} distance={2} decay={2} color="#f4ece0" intensity={0} />
    </>
  );
}
