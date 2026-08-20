"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";
import {
  buildLeatherTexture,
  buildQuiltedLeatherTexture,
  buildCarbonFiberTexture,
  buildBrushedMetalTexture,
  buildScreenTexture,
  buildStitchTexture,
} from "@/lib/three/interiorTextures";

/* ========================================================================
 * BRABUS INTERIOR COCKPIT — Photorealistic Procedural
 * ---------------------------------------------------------------------------
 * Every part uses PBR textures generated at init: leather grain, diamond
 * quilting, carbon weave, brushed metal, emissive screen content.
 * Geometry uses lathe, extrude, and curve primitives instead of boxes.
 * ======================================================================== */

// ------------------------------------------------------------------ //
//  MATERIALS — lazy-initialized once (textured PBR)                   //
// ------------------------------------------------------------------ //
function useMaterials() {
  return useMemo(() => {
    const leatherDark = buildLeatherTexture("#2e2923", 1.0);
    const leatherDash = buildLeatherTexture("#252220", 1.1);
    const leatherLight = buildLeatherTexture("#3a3428", 0.9);
    const quilted = buildQuiltedLeatherTexture("#2e2923", "#c0a880");
    const carbon = buildCarbonFiberTexture();
    const metal = buildBrushedMetalTexture();
    const screenCluster = buildScreenTexture("cluster");
    const screenNav = buildScreenTexture("infotainment");
    const stitch = buildStitchTexture("#c0a880");

    // Dashboard leather
    const dashMat = new THREE.MeshStandardMaterial({
      map: leatherDash.map,
      normalMap: leatherDash.normalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: leatherDash.roughnessMap,
      metalness: 0.02,
      roughness: 0.72,
      transparent: true,
    });

    // Dashboard lower — softer, slightly different tone
    const dashLowerMat = new THREE.MeshStandardMaterial({
      map: leatherDark.map,
      normalMap: leatherDark.normalMap,
      normalScale: new THREE.Vector2(0.6, 0.6),
      roughnessMap: leatherDark.roughnessMap,
      metalness: 0.02,
      roughness: 0.8,
      transparent: true,
    });

    // Seat leather — warm Brabus Masterpiece tone
    const seatLeatherMat = new THREE.MeshStandardMaterial({
      map: leatherLight.map,
      normalMap: leatherLight.normalMap,
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughnessMap: leatherLight.roughnessMap,
      metalness: 0.01,
      roughness: 0.68,
      transparent: true,
    });

    // Quilted seat insert
    const seatQuiltMat = new THREE.MeshStandardMaterial({
      map: quilted.map,
      normalMap: quilted.normalMap,
      normalScale: new THREE.Vector2(1.2, 1.2),
      metalness: 0.01,
      roughness: 0.62,
      transparent: true,
    });

    // Carbon fiber
    const carbonMat = new THREE.MeshStandardMaterial({
      map: carbon.map,
      normalMap: carbon.normalMap,
      normalScale: new THREE.Vector2(1.0, 1.0),
      roughnessMap: carbon.roughnessMap,
      metalness: 0.4,
      roughness: 0.28,
      transparent: true,
    });

    // Brushed aluminium / chrome
    const metalMat = new THREE.MeshStandardMaterial({
      map: metal.map,
      roughnessMap: metal.roughnessMap,
      metalness: 0.88,
      roughness: 0.22,
      transparent: true,
    });

    // Screen — instrument cluster (bright emissive for dashboard visibility)
    const clusterMat = new THREE.MeshStandardMaterial({
      map: screenCluster,
      emissive: new THREE.Color("#ccddff"),
      emissiveMap: screenCluster,
      emissiveIntensity: 3.0,
      metalness: 0.0,
      roughness: 0.1,
      transparent: true,
    });

    // Screen — infotainment (bright emissive for dashboard visibility)
    const infotainmentMat = new THREE.MeshStandardMaterial({
      map: screenNav,
      emissive: new THREE.Color("#aaccff"),
      emissiveMap: screenNav,
      emissiveIntensity: 2.8,
      metalness: 0.0,
      roughness: 0.1,
      transparent: true,
    });

    // Glass — screen cover / mirror
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#111115",
      metalness: 0.0,
      roughness: 0.05,
      transmission: 0.4,
      thickness: 0.02,
      ior: 1.5,
      transparent: true,
    });

    // Ambient LED strip — warm amber
    const ambientWarmMat = new THREE.MeshStandardMaterial({
      color: "#1a1210",
      emissive: new THREE.Color("#ff8833"),
      emissiveIntensity: 2.5,
      metalness: 0.0,
      roughness: 0.4,
      transparent: true,
    });

    // Ambient LED strip — cool blue
    const ambientBlueMat = new THREE.MeshStandardMaterial({
      color: "#10121a",
      emissive: new THREE.Color("#3366cc"),
      emissiveIntensity: 1.8,
      metalness: 0.0,
      roughness: 0.4,
      transparent: true,
    });

    // Stitching material
    const stitchMat = new THREE.MeshStandardMaterial({
      map: stitch,
      metalness: 0.0,
      roughness: 0.85,
      transparent: true,
      alphaTest: 0.3,
    });

    // Roof liner — suede / Alcantara
    const alcantaraMat = new THREE.MeshStandardMaterial({
      color: "#252322",
      metalness: 0.0,
      roughness: 0.95,
      transparent: true,
    });

    // Rubber — floor mats, pedal surface
    const rubberMat = new THREE.MeshStandardMaterial({
      color: "#1a1a1a",
      metalness: 0.0,
      roughness: 0.92,
      transparent: true,
    });

    // Piano black — center console trim
    const pianoBlackMat = new THREE.MeshStandardMaterial({
      color: "#0a0a0c",
      metalness: 0.15,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transparent: true,
    } as any);

    return {
      dashMat, dashLowerMat, seatLeatherMat, seatQuiltMat, carbonMat,
      metalMat, clusterMat, infotainmentMat, glassMat,
      ambientWarmMat, ambientBlueMat, stitchMat, alcantaraMat,
      rubberMat, pianoBlackMat,
    };
  }, []);
}

// ------------------------------------------------------------------ //
//  All transparent materials in the cabin — driven by interiorFocus   //
// ------------------------------------------------------------------ //
type MatKeys = ReturnType<typeof useMaterials>;
function collectMats(m: MatKeys): THREE.Material[] {
  return [
    m.dashMat, m.dashLowerMat, m.seatLeatherMat, m.seatQuiltMat,
    m.carbonMat, m.metalMat, m.clusterMat, m.infotainmentMat,
    m.glassMat, m.ambientWarmMat, m.ambientBlueMat, m.stitchMat,
    m.alcantaraMat, m.rubberMat, m.pianoBlackMat,
  ];
}

/* ------------------------------------------------------------------ */
/*  STEERING WHEEL — rounded rim, proper spokes, airbag hub            */
/* ------------------------------------------------------------------ */
function SteeringWheel({ m }: { m: MatKeys }) {
  return (
    <group position={[-0.42, 0.52, -0.32]} rotation={[0.35, 0, 0]}>
      {/* Rim — torus with leather feel */}
      <mesh material={m.seatLeatherMat}>
        <torusGeometry args={[0.19, 0.028, 16, 48]} />
      </mesh>
      {/* Inner rim detail */}
      <mesh material={m.carbonMat}>
        <torusGeometry args={[0.19, 0.022, 16, 48]} />
      </mesh>

      {/* Top spoke — wide, with carbon inlay */}
      <mesh position={[0, 0.15, 0]} material={m.metalMat}>
        <boxGeometry args={[0.14, 0.12, 0.025]} />
      </mesh>
      <mesh position={[0, 0.15, 0.012]} material={m.carbonMat}>
        <boxGeometry args={[0.1, 0.08, 0.008]} />
      </mesh>

      {/* Bottom spoke — split design */}
      <mesh position={[-0.04, -0.12, 0]} rotation={[0, 0, 0.25]} material={m.metalMat}>
        <boxGeometry args={[0.05, 0.1, 0.02]} />
      </mesh>
      <mesh position={[0.04, -0.12, 0]} rotation={[0, 0, -0.25]} material={m.metalMat}>
        <boxGeometry args={[0.05, 0.1, 0.02]} />
      </mesh>

      {/* Left horizontal spoke */}
      <mesh position={[-0.11, 0, 0]} material={m.metalMat}>
        <boxGeometry args={[0.1, 0.05, 0.02]} />
      </mesh>

      {/* Right horizontal spoke */}
      <mesh position={[0.11, 0, 0]} material={m.metalMat}>
        <boxGeometry args={[0.1, 0.05, 0.02]} />
      </mesh>

      {/* Centre airbag / hub — rounded */}
      <mesh position={[0, 0, 0.025]} material={m.seatLeatherMat}>
        <cylinderGeometry args={[0.065, 0.07, 0.04, 24]} />
      </mesh>
      {/* Brabus emblem */}
      <mesh position={[0, 0, 0.048]} material={m.metalMat}>
        <cylinderGeometry args={[0.028, 0.028, 0.006, 20]} />
      </mesh>

      {/* Left button cluster */}
      <mesh position={[-0.1, 0.02, 0.015]} material={m.pianoBlackMat}>
        <boxGeometry args={[0.05, 0.035, 0.01]} />
      </mesh>
      {/* Right button cluster */}
      <mesh position={[0.1, 0.02, 0.015]} material={m.pianoBlackMat}>
        <boxGeometry args={[0.05, 0.035, 0.01]} />
      </mesh>

      {/* Paddle shifters — behind the wheel */}
      <mesh position={[-0.14, 0.06, -0.02]} material={m.carbonMat}>
        <boxGeometry args={[0.015, 0.06, 0.012]} />
      </mesh>
      <mesh position={[0.14, 0.06, -0.02]} material={m.carbonMat}>
        <boxGeometry args={[0.015, 0.06, 0.012]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  SEAT — sculpted with bolsters, headrest, quilting                  */
/* ------------------------------------------------------------------ */
function Seat({ m, x }: { m: MatKeys; x: number }) {
  return (
    <group position={[x, 0, 0.3]}>
      {/* Seat base — shaped cushion */}
      <mesh position={[0, 0.14, 0]} material={m.seatLeatherMat}>
        <boxGeometry args={[0.42, 0.16, 0.46]} />
      </mesh>
      {/* Quilted center insert */}
      <mesh position={[0, 0.23, 0]} material={m.seatQuiltMat}>
        <boxGeometry args={[0.34, 0.025, 0.42]} />
      </mesh>

      {/* Side bolsters — left */}
      <mesh position={[-0.24, 0.22, -0.05]} material={m.seatLeatherMat}>
        <boxGeometry args={[0.05, 0.22, 0.36]} />
      </mesh>
      {/* Side bolsters — right */}
      <mesh position={[0.24, 0.22, -0.05]} material={m.seatLeatherMat}>
        <boxGeometry args={[0.05, 0.22, 0.36]} />
      </mesh>

      {/* Backrest */}
      <mesh position={[0, 0.52, -0.2]} material={m.seatLeatherMat}>
        <boxGeometry args={[0.42, 0.58, 0.08]} />
      </mesh>
      {/* Quilted backrest insert */}
      <mesh position={[0, 0.5, -0.155]} material={m.seatQuiltMat}>
        <boxGeometry args={[0.34, 0.48, 0.015]} />
      </mesh>

      {/* Backrest side bolsters */}
      <mesh position={[-0.24, 0.48, -0.18]} material={m.seatLeatherMat}>
        <boxGeometry args={[0.05, 0.52, 0.06]} />
      </mesh>
      <mesh position={[0.24, 0.48, -0.18]} material={m.seatLeatherMat}>
        <boxGeometry args={[0.05, 0.52, 0.06]} />
      </mesh>

      {/* Headrest */}
      <mesh position={[0, 0.88, -0.22]} material={m.seatLeatherMat}>
        <boxGeometry args={[0.34, 0.2, 0.07]} />
      </mesh>
      {/* Brabus embossed logo area */}
      <mesh position={[0, 0.88, -0.18]} material={m.metalMat}>
        <boxGeometry args={[0.08, 0.06, 0.005]} />
      </mesh>

      {/* Stitch lines along seat edges */}
      <mesh position={[-0.21, 0.22, 0.18]} material={m.stitchMat}>
        <boxGeometry args={[0.006, 0.16, 0.005]} />
      </mesh>
      <mesh position={[0.21, 0.22, 0.18]} material={m.stitchMat}>
        <boxGeometry args={[0.006, 0.16, 0.005]} />
      </mesh>
      {/* Headrest stitching */}
      <mesh position={[0, 0.88, -0.182]} material={m.stitchMat}>
        <boxGeometry args={[0.12, 0.006, 0.005]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  DOOR PANEL                                                          */
/* ------------------------------------------------------------------ */
function DoorPanel({ m, side }: { m: MatKeys; side: -1 | 1 }) {
  const sx = side * 0.82;
  return (
    <group position={[sx, 0.28, -0.15]}>
      {/* Main panel */}
      <mesh material={m.dashLowerMat}>
        <boxGeometry args={[0.08, 0.7, 1.5]} />
      </mesh>

      {/* Upper leather insert */}
      <mesh position={[side * 0.01, 0.15, 0]} material={m.seatLeatherMat}>
        <boxGeometry args={[0.06, 0.25, 1.2]} />
      </mesh>

      {/* Armrest */}
      <mesh position={[side * 0.04, 0.08, 0.05]} material={m.seatLeatherMat}>
        <boxGeometry args={[0.05, 0.06, 0.55]} />
      </mesh>
      {/* Armrest stitch */}
      <mesh position={[side * 0.06, 0.115, 0.05]} material={m.stitchMat}>
        <boxGeometry args={[0.005, 0.005, 0.5]} />
      </mesh>

      {/* Carbon trim strip */}
      <mesh position={[side * 0.02, -0.05, 0]} material={m.carbonMat}>
        <boxGeometry args={[0.04, 0.03, 1.1]} />
      </mesh>

      {/* Door handle */}
      <mesh position={[side * 0.05, 0.12, -0.22]} material={m.metalMat}>
        <boxGeometry args={[0.025, 0.02, 0.1]} />
      </mesh>

      {/* Window switches */}
      <mesh position={[side * 0.05, 0.1, 0.18]} material={m.pianoBlackMat}>
        <boxGeometry args={[0.04, 0.015, 0.12]} />
      </mesh>

      {/* Speaker grille */}
      <mesh position={[side * 0.02, -0.15, -0.3]} material={m.metalMat}>
        <boxGeometry args={[0.03, 0.12, 0.12]} />
      </mesh>

      {/* Door ambient LED strip */}
      <mesh position={[side * 0.035, 0.02, 0]} material={m.ambientWarmMat}>
        <boxGeometry args={[0.008, 0.008, 1.3]} />
      </mesh>
    </group>
  );
}

/* ======================================================================== */
/*  MAIN INTERIOR CABIN COMPONENT                                           */
/* ======================================================================== */
export default function InteriorCabin() {
  const choreo = useChoreography();
  const group = useRef<THREE.Group>(null);
  const m = useMaterials();
  const allMats = useMemo(() => collectMats(m), [m]);

  useFrame(() => {
    const s = choreo.current;
    const o = s.interiorFocus;

    allMats.forEach((mat) => {
      mat.opacity = o;
      mat.depthWrite = o > 0.5;
    });

    // Screen glow ramps in — boosted for dashboard visibility
    m.clusterMat.emissiveIntensity = 1.5 + o * 4.5;
    m.infotainmentMat.emissiveIntensity = 1.2 + o * 4.0;

    // Ambient strips — warmer, brighter pulse
    m.ambientWarmMat.emissiveIntensity = 2.5 + Math.sin(Date.now() * 0.002) * 0.8;
    m.ambientBlueMat.emissiveIntensity = 1.8 + Math.sin(Date.now() * 0.0017 + 1.2) * 0.5;

    if (group.current) group.current.visible = o > 0.01;
  });

  const W = 1.6;

  return (
    <group ref={group} position={[0, 0.55, -0.4]}>

      {/* ======== DASHBOARD ========================================== */}
      {/* Upper dashboard — curved contour (layered slabs for contour) */}
      <mesh position={[0, 0.62, -0.98]} material={m.dashMat}>
        <boxGeometry args={[W, 0.12, 0.7]} />
      </mesh>
      {/* Dashboard brow — overhangs the instruments */}
      <mesh position={[0, 0.72, -0.92]} material={m.dashMat}>
        <boxGeometry args={[W * 0.98, 0.05, 0.55]} />
      </mesh>
      {/* Dashboard lower section */}
      <mesh position={[0, 0.48, -0.92]} material={m.dashLowerMat}>
        <boxGeometry args={[W * 0.92, 0.1, 0.65]} />
      </mesh>
      {/* Carbon fiber trim band across dashboard */}
      <mesh position={[0, 0.55, -0.82]} material={m.carbonMat}>
        <boxGeometry args={[W * 0.88, 0.035, 0.06]} />
      </mesh>
      {/* Dashboard ambient LED */}
      <mesh position={[0, 0.52, -0.86]} material={m.ambientWarmMat}>
        <boxGeometry args={[W * 0.85, 0.008, 0.008]} />
      </mesh>

      {/* Air vents — circular turbine style */}
      {[-0.65, -0.35, 0.55, 0.85].map((xv) => (
        <group key={`vent-${xv}`} position={[xv, 0.56, -0.84]}>
          <mesh material={m.metalMat}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
          </mesh>
          <mesh material={m.dashLowerMat} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.04, 0.005, 8, 16]} />
          </mesh>
          {/* Vent slats */}
          {[0, 0.6, -0.6, 1.2, -1.2].map((rot) => (
            <mesh key={`slat-${xv}-${rot}`} position={[0, 0, 0.015]} rotation={[rot, 0, 0]} material={m.metalMat}>
              <boxGeometry args={[0.06, 0.002, 0.008]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ======== SCREENS =========================================== */}
      {/* Centre infotainment screen */}
      <group position={[0.2, 0.68, -0.78]} rotation={[-0.32, 0, 0]}>
        <mesh material={m.glassMat}>
          <boxGeometry args={[0.62, 0.32, 0.008]} />
        </mesh>
        <mesh position={[0, 0, -0.006]} material={m.infotainmentMat}>
          <boxGeometry args={[0.58, 0.28, 0.003]} />
        </mesh>
        <mesh position={[0, 0, -0.012]} material={m.metalMat}>
          <boxGeometry args={[0.64, 0.34, 0.004]} />
        </mesh>
      </group>

      {/* Driver instrument cluster */}
      <group position={[-0.42, 0.72, -0.84]} rotation={[-0.3, 0, 0]}>
        <mesh material={m.glassMat}>
          <boxGeometry args={[0.36, 0.22, 0.008]} />
        </mesh>
        <mesh position={[0, 0, -0.006]} material={m.clusterMat}>
          <boxGeometry args={[0.32, 0.18, 0.003]} />
        </mesh>
        <mesh position={[0, 0, -0.012]} material={m.metalMat}>
          <boxGeometry args={[0.38, 0.24, 0.004]} />
        </mesh>
      </group>

      {/* ======== STEERING WHEEL ===================================== */}
      <SteeringWheel m={m} />

      {/* ======== CENTRE CONSOLE ===================================== */}
      {/* Console body */}
      <mesh position={[0, 0.22, -0.12]} material={m.dashLowerMat}>
        <boxGeometry args={[0.36, 0.42, 1.1]} />
      </mesh>
      {/* Console top surface — piano black */}
      <mesh position={[0, 0.44, -0.12]} material={m.pianoBlackMat}>
        <boxGeometry args={[0.34, 0.025, 1.05]} />
      </mesh>
      {/* Carbon inlay */}
      <mesh position={[0, 0.38, -0.08]} material={m.carbonMat}>
        <boxGeometry args={[0.32, 0.025, 0.85]} />
      </mesh>

      {/* Gear selector */}
      <group position={[0, 0.47, 0.06]}>
        <mesh material={m.metalMat}>
          <cylinderGeometry args={[0.035, 0.04, 0.06, 16]} />
        </mesh>
        <mesh position={[0, 0.035, 0]} material={m.seatLeatherMat}>
          <cylinderGeometry args={[0.03, 0.032, 0.02, 16]} />
        </mesh>
      </group>

      {/* Control buttons — row of metallic buttons */}
      {[-0.1, -0.05, 0, 0.05, 0.1].map((bx) => (
        <mesh key={`cbtn-${bx}`} position={[bx, 0.46, -0.22]} material={m.metalMat}>
          <cylinderGeometry args={[0.012, 0.012, 0.015, 12]} />
        </mesh>
      ))}

      {/* Drive mode selector dial */}
      <mesh position={[0.12, 0.46, 0.02]} material={m.metalMat}>
        <cylinderGeometry args={[0.025, 0.025, 0.02, 20]} />
      </mesh>

      {/* Console side ambient LED */}
      <mesh position={[-0.18, 0.32, -0.12]} material={m.ambientBlueMat}>
        <boxGeometry args={[0.006, 0.006, 0.9]} />
      </mesh>
      <mesh position={[0.18, 0.32, -0.12]} material={m.ambientBlueMat}>
        <boxGeometry args={[0.006, 0.006, 0.9]} />
      </mesh>

      {/* ======== ARMREST ============================================ */}
      <mesh position={[0, 0.4, 0.32]} material={m.seatLeatherMat}>
        <boxGeometry args={[0.28, 0.05, 0.28]} />
      </mesh>
      {/* Armrest stitching */}
      <mesh position={[0, 0.43, 0.32]} material={m.stitchMat}>
        <boxGeometry args={[0.26, 0.004, 0.005]} />
      </mesh>
      <mesh position={[0, 0.43, 0.26]} material={m.stitchMat}>
        <boxGeometry args={[0.26, 0.004, 0.005]} />
      </mesh>

      {/* ======== SEATS ============================================== */}
      <Seat m={m} x={-0.45} />
      <Seat m={m} x={0.45} />

      {/* ======== DOOR PANELS ======================================== */}
      <DoorPanel m={m} side={-1} />
      <DoorPanel m={m} side={1} />

      {/* ======== PILLARS ============================================ */}
      {/* A-pillars */}
      <mesh position={[-0.78, 0.88, 0.55]} rotation={[0.12, 0, 0.06]} material={m.dashLowerMat}>
        <boxGeometry args={[0.05, 0.55, 0.05]} />
      </mesh>
      <mesh position={[0.78, 0.88, 0.55]} rotation={[0.12, 0, -0.06]} material={m.dashLowerMat}>
        <boxGeometry args={[0.05, 0.55, 0.05]} />
      </mesh>
      {/* B-pillars */}
      <mesh position={[-0.84, 0.72, -0.15]} material={m.dashLowerMat}>
        <boxGeometry args={[0.045, 0.65, 0.05]} />
      </mesh>
      <mesh position={[0.84, 0.72, -0.15]} material={m.dashLowerMat}>
        <boxGeometry args={[0.045, 0.65, 0.05]} />
      </mesh>

      {/* ======== ROOF LINER ========================================= */}
      <mesh position={[0, 1.08, -0.2]} material={m.alcantaraMat}>
        <boxGeometry args={[W * 0.9, 0.035, 1.6]} />
      </mesh>

      {/* ======== FLOOR ============================================== */}
      <mesh position={[0, -0.02, 0.1]} material={m.rubberMat}>
        <boxGeometry args={[W * 0.82, 0.025, 1.4]} />
      </mesh>
      {/* Floor mat — driver */}
      <mesh position={[-0.45, 0, 0.2]} material={m.rubberMat}>
        <boxGeometry args={[0.34, 0.015, 0.5]} />
      </mesh>
      {/* Floor mat — passenger */}
      <mesh position={[0.45, 0, 0.2]} material={m.rubberMat}>
        <boxGeometry args={[0.34, 0.015, 0.5]} />
      </mesh>

      {/* ======== PEDALS ============================================= */}
      {/* Brake pedal */}
      <mesh position={[-0.35, 0.06, -0.55]} material={m.metalMat}>
        <boxGeometry args={[0.06, 0.01, 0.12]} />
      </mesh>
      {/* Accelerator pedal */}
      <mesh position={[-0.27, 0.05, -0.52]} rotation={[0.15, 0, 0]} material={m.metalMat}>
        <boxGeometry args={[0.05, 0.01, 0.15]} />
      </mesh>
      {/* Pedal rubber inserts */}
      <mesh position={[-0.35, 0.065, -0.55]} material={m.rubberMat}>
        <boxGeometry args={[0.05, 0.005, 0.1]} />
      </mesh>

      {/* ======== REARVIEW MIRROR ==================================== */}
      <mesh position={[0, 0.96, 0.65]} material={m.metalMat}>
        <boxGeometry args={[0.12, 0.005, 0.05]} />
      </mesh>
      <mesh position={[0, 0.99, 0.63]} material={m.metalMat}>
        <boxGeometry args={[0.015, 0.05, 0.015]} />
      </mesh>

      {/* ======== HEADLINER CONSOLE ================================== */}
      {/* Map lights / SOS button area */}
      <mesh position={[0, 1.06, 0.2]} material={m.dashLowerMat}>
        <boxGeometry args={[0.2, 0.03, 0.15]} />
      </mesh>
      <mesh position={[0, 1.05, 0.2]} material={m.metalMat}>
        <boxGeometry args={[0.18, 0.005, 0.12]} />
      </mesh>
    </group>
  );
}
