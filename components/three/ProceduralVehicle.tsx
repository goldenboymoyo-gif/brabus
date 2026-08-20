"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";
import { scrollState } from "@/lib/three/scrollState";

// ============================================================================
// REALISTIC PROCEDURAL BRABUS G-CLASS
// ----------------------------------------------------------------------------
// A detailed, realistic Brabus G-Class SUV built from Three.js primitives
// with proper proportions, curved surfaces, multi-spoke wheels, detailed
// grille, projector headlights, running boards, roof rails, and exhaust tips.
// ============================================================================

/* ------------------------------------------------------------------ */
/*  WHEEL — multi-spoke Brabus Monoblock style                        */
/* ------------------------------------------------------------------ */
function Wheel({
  position,
  radius = 0.44,
  materials,
}: {
  position: [number, number, number];
  radius?: number;
  materials: {
    tire: THREE.Material;
    rim: THREE.Material;
    spoke: THREE.Material;
    disc: THREE.Material;
    caliper: THREE.Material;
    cap: THREE.Material;
  };
}) {
  const spokeCount = 10;
  return (
    <group position={position}>
      {/* Tire — slightly rounded profile via two offset cylinders */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow material={materials.tire}>
        <cylinderGeometry args={[radius, radius, 0.32, 32]} />
      </mesh>
      {/* Tire sidewall bulge — outer ring */}
      <mesh rotation={[0, 0, Math.PI / 2]} material={materials.tire}>
        <torusGeometry args={[radius, 0.045, 8, 32]} />
      </mesh>

      {/* Rim barrel */}
      <mesh rotation={[0, 0, Math.PI / 2]} material={materials.rim}>
        <cylinderGeometry args={[radius * 0.72, radius * 0.72, 0.34, 32]} />
      </mesh>

      {/* Rim lip — outer ring */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.17, 0, 0]} material={materials.rim}>
        <torusGeometry args={[radius * 0.72, 0.018, 8, 32]} />
      </mesh>

      {/* Spokes — 10 thin bars radiating from center */}
      {Array.from({ length: spokeCount }).map((_, i) => {
        const angle = (i * Math.PI * 2) / spokeCount;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const spokeLen = radius * 0.58;
        return (
          <mesh
            key={`spoke-${i}`}
            position={[0.17, sin * radius * 0.36, cos * radius * 0.36]}
            rotation={[angle, 0, 0]}
            material={materials.spoke}
          >
            <boxGeometry args={[0.04, spokeLen, 0.055]} />
          </mesh>
        );
      })}

      {/* Center hub */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.18, 0, 0]} material={materials.cap}>
        <cylinderGeometry args={[radius * 0.14, radius * 0.14, 0.06, 20]} />
      </mesh>

      {/* Center cap emblem — slight dome */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.21, 0, 0]} material={materials.rim}>
        <cylinderGeometry args={[radius * 0.09, radius * 0.11, 0.02, 16]} />
      </mesh>

      {/* Brake disc — visible behind spokes */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.04, 0, 0]} material={materials.disc}>
        <cylinderGeometry args={[radius * 0.56, radius * 0.56, 0.018, 32]} />
      </mesh>

      {/* Brake disc ventilation holes ring */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.04, 0, 0]} material={materials.disc}>
        <torusGeometry args={[radius * 0.42, 0.012, 6, 24]} />
      </mesh>

      {/* Caliper — Brabus red */}
      <mesh position={[0.1, radius * 0.46, 0]} material={materials.caliper}>
        <boxGeometry args={[0.18, 0.2, 0.14]} />
      </mesh>
      {/* Caliper bridge */}
      <mesh position={[0.1, radius * 0.46, 0]} material={materials.caliper}>
        <boxGeometry args={[0.2, 0.06, 0.16]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  HEADLIGHT — round projector with chrome ring + LED DRL strip       */
/* ------------------------------------------------------------------ */
function Headlight({
  position,
  headlightMat,
  drlMat,
  chromeMat,
  lensMat,
}: {
  position: [number, number, number];
  headlightMat: THREE.Material;
  drlMat: THREE.Material;
  chromeMat: THREE.Material;
  lensMat: THREE.Material;
}) {
  return (
    <group position={position}>
      {/* Outer chrome ring */}
      <mesh material={chromeMat}>
        <torusGeometry args={[0.14, 0.022, 8, 32]} />
      </mesh>
      {/* Inner chrome ring */}
      <mesh position={[0, 0, 0.01]} material={chromeMat}>
        <torusGeometry args={[0.1, 0.014, 8, 28]} />
      </mesh>
      {/* Lens */}
      <mesh position={[0, 0, -0.005]} material={lensMat}>
        <circleGeometry args={[0.135, 32]} />
      </mesh>
      {/* Projector beam */}
      <mesh position={[0, 0, -0.01]} material={headlightMat}>
        <circleGeometry args={[0.07, 24]} />
      </mesh>
      {/* DRL strip — half ring at bottom */}
      <mesh position={[0, -0.06, 0.005]} material={drlMat}>
        <torusGeometry args={[0.11, 0.012, 6, 16, Math.PI]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  TAILLIGHT — vertical LED bar                                      */
/* ------------------------------------------------------------------ */
function Taillight({
  position,
  taillightMat,
  lensMat,
}: {
  position: [number, number, number];
  taillightMat: THREE.Material;
  lensMat: THREE.Material;
}) {
  return (
    <group position={position}>
      {/* Housing */}
      <mesh material={lensMat}>
        <boxGeometry args={[0.12, 0.28, 0.04]} />
      </mesh>
      {/* Upper LED segment */}
      <mesh position={[0, 0.06, 0.01]} material={taillightMat}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
      </mesh>
      {/* Middle LED segment */}
      <mesh position={[0, -0.02, 0.01]} material={taillightMat}>
        <boxGeometry args={[0.08, 0.06, 0.02]} />
      </mesh>
      {/* Lower LED segment */}
      <mesh position={[0, -0.09, 0.01]} material={taillightMat}>
        <boxGeometry args={[0.08, 0.06, 0.02]} />
      </mesh>
      {/* Chrome trim */}
      <mesh position={[0, 0, 0.025]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.04, 0.05, 16]} />
      </mesh>
    </group>
  );
}

/* ================================================================== */
/*  MAIN VEHICLE                                                       */
/* ================================================================== */
export default function ProceduralVehicle() {
  const choreo = useChoreography();
  const group = useRef<THREE.Group>(null);
  const wheelRefs = useRef<(THREE.Group | null)[]>([]);

  const mats = useMemo(() => {
    // Body paint — dark obsidian with physical clearcoat-like properties
    const body = new THREE.MeshPhysicalMaterial({
      color: "#0c0c0f",
      metalness: 0.65,
      roughness: 0.22,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      reflectivity: 0.9,
    });

    // Cabin / upper body — slightly different shade
    const cabin = new THREE.MeshPhysicalMaterial({
      color: "#0e0e11",
      metalness: 0.55,
      roughness: 0.28,
      clearcoat: 0.7,
      clearcoatRoughness: 0.2,
    });

    // Glass — dark tinted
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#081018",
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity: 0.85,
      transmission: 0.3,
      thickness: 0.5,
    });

    // Trim — dark satin plastic
    const trim = new THREE.MeshStandardMaterial({
      color: "#1a1a1d",
      metalness: 0.5,
      roughness: 0.5,
    });

    // Chrome — high polish
    const chrome = new THREE.MeshStandardMaterial({
      color: "#e8e8ec",
      metalness: 0.98,
      roughness: 0.08,
    });

    // Dark chrome — for grille slats
    const darkChrome = new THREE.MeshStandardMaterial({
      color: "#2a2a2e",
      metalness: 0.9,
      roughness: 0.2,
    });

    // Rim — polished aluminum
    const rim = new THREE.MeshStandardMaterial({
      color: "#d8d8dc",
      metalness: 0.94,
      roughness: 0.15,
    });

    // Spoke — slightly darker
    const spoke = new THREE.MeshStandardMaterial({
      color: "#c0c0c4",
      metalness: 0.9,
      roughness: 0.2,
    });

    // Tire — rubber
    const tire = new THREE.MeshStandardMaterial({
      color: "#060606",
      metalness: 0,
      roughness: 0.88,
    });

    // Brake disc — steel
    const disc = new THREE.MeshStandardMaterial({
      color: "#8a8a8e",
      metalness: 0.85,
      roughness: 0.35,
    });

    // Caliper — Brabus red
    const caliper = new THREE.MeshStandardMaterial({
      color: "#cc1a1a",
      metalness: 0.6,
      roughness: 0.3,
    });

    // Center cap
    const cap = new THREE.MeshStandardMaterial({
      color: "#1a1a1e",
      metalness: 0.8,
      roughness: 0.2,
    });

    // Headlight — emissive white
    const headlight = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      emissive: new THREE.Color("#e8f0ff"),
      emissiveIntensity: 0.4,
      metalness: 0.1,
      roughness: 0.15,
    });

    // DRL — daytime running light strip
    const drl = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      emissive: new THREE.Color("#f0f4ff"),
      emissiveIntensity: 0.6,
      metalness: 0.1,
      roughness: 0.2,
    });

    // Taillight
    const taillight = new THREE.MeshStandardMaterial({
      color: "#1a0505",
      emissive: new THREE.Color("#ff2020"),
      emissiveIntensity: 0.3,
      metalness: 0.2,
      roughness: 0.3,
    });

    // Lens cover
    const lens = new THREE.MeshStandardMaterial({
      color: "#181818",
      metalness: 0.3,
      roughness: 0.15,
      transparent: true,
      opacity: 0.7,
    });

    // Grille — black mesh
    const grille = new THREE.MeshStandardMaterial({
      color: "#080808",
      metalness: 0.35,
      roughness: 0.65,
    });

    // Fog light
    const foglight = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      emissive: new THREE.Color("#dde4ff"),
      emissiveIntensity: 0.2,
      metalness: 0.1,
      roughness: 0.2,
    });

    // Carbon fiber — for hood accents
    const carbon = new THREE.MeshStandardMaterial({
      color: "#111114",
      metalness: 0.4,
      roughness: 0.35,
    });

    // Running board — brushed aluminum
    const runningBoard = new THREE.MeshStandardMaterial({
      color: "#999",
      metalness: 0.85,
      roughness: 0.35,
    });

    // Exhaust — chrome
    const exhaust = new THREE.MeshStandardMaterial({
      color: "#b0b0b4",
      metalness: 0.95,
      roughness: 0.12,
    });

    // Roof rail
    const roofRail = new THREE.MeshStandardMaterial({
      color: "#333336",
      metalness: 0.7,
      roughness: 0.3,
    });

    return {
      body, cabin, glass, trim, chrome, darkChrome, rim, spoke, tire,
      disc, caliper, cap, headlight, drl, taillight, lens, grille,
      foglight, carbon, runningBoard, exhaust, roofRail,
    };
  }, []);

  const wheelMats = useMemo(
    () => ({
      tire: mats.tire, rim: mats.rim, spoke: mats.spoke,
      disc: mats.disc, caliper: mats.caliper, cap: mats.cap,
    }),
    [mats]
  );

  const bodyLikeMaterials = useMemo(
    () => [
      mats.body, mats.cabin, mats.trim, mats.chrome, mats.darkChrome,
      mats.rim, mats.spoke, mats.tire, mats.disc, mats.caliper, mats.cap,
      mats.carbon, mats.runningBoard, mats.roofRail,
    ],
    [mats]
  );

  useFrame((_, delta) => {
    const s = choreo.current;

    // Body opacity sweep
    const opacity = s.bodyOpacity;
    bodyLikeMaterials.forEach((m) => {
      const sm = m as THREE.MeshPhysicalMaterial;
      sm.transparent = opacity < 0.97;
      sm.opacity = opacity;
      sm.depthWrite = opacity > 0.5;
    });
    mats.glass.opacity = 0.85 * opacity;
    mats.glass.transparent = true;
    mats.headlight.emissiveIntensity = 0.35 + s.headlight * 2.1;
    mats.drl.emissiveIntensity = 0.4 + s.headlight * 1.8;

    // Wheel rotation
    const spin = 0.12 + Math.abs(scrollState.velocity) * 14;
    wheelRefs.current.forEach((w) => {
      if (w) w.rotation.x -= spin * delta;
    });

    if (group.current) {
      group.current.visible = opacity > 0.01;
    }
  });

  const halfW = 0.98;
  const axleZ = 1.48;
  const bodyY = 0.64;

  return (
    <group ref={group} position={[0, 0, 0]}>

      {/* ============================================================ */}
      {/*  LOWER BODY SHELL                                             */}
      {/* ============================================================ */}
      {/* Main body — wider and lower for aggressive stance */}
      <mesh position={[0, bodyY, 0]} material={mats.body} castShadow receiveShadow>
        <boxGeometry args={[1.92, 0.88, 4.4]} />
      </mesh>

      {/* Body side skirts — lower edge detail */}
      <mesh position={[0, bodyY - 0.44, 0]} material={mats.trim}>
        <boxGeometry args={[1.96, 0.06, 4.3]} />
      </mesh>

      {/* Front fender flares — wider arches */}
      {[1, -1].map((side) => (
        <mesh
          key={`ff-${side}`}
          position={[side * 0.96, bodyY - 0.1, axleZ]}
          material={mats.body}
        >
          <boxGeometry args={[0.16, 0.52, 0.9]} />
        </mesh>
      ))}

      {/* Rear fender flares */}
      {[1, -1].map((side) => (
        <mesh
          key={`rf-${side}`}
          position={[side * 0.96, bodyY - 0.1, -axleZ]}
          material={mats.body}
        >
          <boxGeometry args={[0.16, 0.52, 0.9]} />
        </mesh>
      ))}

      {/* Lower body side character line — crease */}
      {[1, -1].map((side) => (
        <mesh
          key={`cl-${side}`}
          position={[side * 0.97, bodyY + 0.08, 0]}
          material={mats.darkChrome}
        >
          <boxGeometry args={[0.02, 0.025, 4.2]} />
        </mesh>
      ))}

      {/* ============================================================ */}
      {/*  HOOD                                                         */}
      {/* ============================================================ */}
      {/* Main hood panel */}
      <mesh position={[0, bodyY + 0.5, 1.65]} material={mats.body} castShadow>
        <boxGeometry args={[1.78, 0.18, 1.0]} />
      </mesh>

      {/* Hood power dome — central bulge */}
      <mesh position={[0, bodyY + 0.62, 1.55]} material={mats.carbon}>
        <boxGeometry args={[0.52, 0.08, 0.65]} />
      </mesh>

      {/* Hood side vents — Brabus signature */}
      {[1, -1].map((side) => (
        <mesh
          key={`hvent-${side}`}
          position={[side * 0.52, bodyY + 0.56, 1.85]}
          material={mats.darkChrome}
        >
          <boxGeometry args={[0.22, 0.06, 0.18]} />
        </mesh>
      ))}

      {/* Hood edge trim */}
      <mesh position={[0, bodyY + 0.58, 2.12]} material={mats.chrome}>
        <boxGeometry args={[1.6, 0.03, 0.02]} />
      </mesh>

      {/* ============================================================ */}
      {/*  FRONT BUMPER                                                  */}
      {/* ============================================================ */}
      {/* Main bumper body */}
      <mesh position={[0, 0.42, 2.12]} material={mats.trim}>
        <boxGeometry args={[1.88, 0.48, 0.32]} />
      </mesh>

      {/* Upper bumper lip — chrome */}
      <mesh position={[0, 0.64, 2.18]} material={mats.chrome}>
        <boxGeometry args={[1.82, 0.025, 0.04]} />
      </mesh>

      {/* Lower bumper valance — carbon fiber look */}
      <mesh position={[0, 0.22, 2.2]} material={mats.carbon}>
        <boxGeometry args={[1.76, 0.14, 0.22]} />
      </mesh>

      {/* Front air intake — left */}
      <mesh position={[-0.55, 0.42, 2.26]} material={mats.grille}>
        <boxGeometry args={[0.48, 0.22, 0.04]} />
      </mesh>
      {/* Front air intake — right */}
      <mesh position={[0.55, 0.42, 2.26]} material={mats.grille}>
        <boxGeometry args={[0.48, 0.22, 0.04]} />
      </mesh>

      {/* Air intake horizontal slats */}
      {[-0.55, 0.55].map((x) =>
        [-0.04, 0.04].map((y) => (
          <mesh key={`aint-${x}-${y}`} position={[x, 0.42 + y, 2.27]} material={mats.darkChrome}>
            <boxGeometry args={[0.44, 0.012, 0.02]} />
          </mesh>
        ))
      )}

      {/* Fog lights — small round units in bumper */}
      {[-0.62, 0.62].map((x) => (
        <group key={`fog-${x}`} position={[x, 0.32, 2.28]}>
          <mesh material={mats.chrome}>
            <torusGeometry args={[0.055, 0.012, 8, 20]} />
          </mesh>
          <mesh position={[0, 0, -0.005]} material={mats.foglight}>
            <circleGeometry args={[0.045, 20]} />
          </mesh>
        </group>
      ))}

      {/* Tow hook cover — center lower */}
      <mesh position={[0, 0.28, 2.3]} material={mats.trim}>
        <boxGeometry args={[0.28, 0.1, 0.04]} />
      </mesh>

      {/* Front skid plate */}
      <mesh position={[0, 0.16, 2.25]} material={mats.darkChrome}>
        <boxGeometry args={[1.5, 0.04, 0.2]} />
      </mesh>

      {/* ============================================================ */}
      {/*  GRILLE — Brabus horizontal slat design                       */}
      {/* ============================================================ */}
      {/* Grille surround — chrome */}
      <mesh position={[0, 0.84, 2.18]} material={mats.chrome}>
        <boxGeometry args={[1.06, 0.4, 0.03]} />
      </mesh>

      {/* Grille backing */}
      <mesh position={[0, 0.84, 2.16]} material={mats.grille}>
        <boxGeometry args={[0.96, 0.34, 0.03]} />
      </mesh>

      {/* Horizontal slats — 5 bars */}
      {[-0.12, -0.04, 0.04, 0.12].map((y) => (
        <mesh key={`slat-${y}`} position={[0, 0.84 + y, 2.19]} material={mats.darkChrome}>
          <boxGeometry args={[0.9, 0.018, 0.015]} />
        </mesh>
      ))}

      {/* BRABUS badge — center of grille */}
      <mesh position={[0, 0.84, 2.2]} material={mats.chrome}>
        <boxGeometry args={[0.22, 0.08, 0.012]} />
      </mesh>

      {/* ============================================================ */}
      {/*  HEADLIGHTS                                                    */}
      {/* ============================================================ */}
      {[-0.65, 0.65].map((x) => (
        <Headlight
          key={`hl-${x}`}
          position={[x, 0.82, 2.2]}
          headlightMat={mats.headlight}
          drlMat={mats.drl}
          chromeMat={mats.chrome}
          lensMat={mats.lens}
        />
      ))}

      {/* ============================================================ */}
      {/*  CABIN / GREENHOUSE                                            */}
      {/* ============================================================ */}
      {/* Main cabin */}
      <mesh position={[0, 1.36, -0.15]} material={mats.cabin} castShadow>
        <boxGeometry args={[1.74, 0.72, 2.35]} />
      </mesh>

      {/* Cabin taper — slight inward slope on sides */}
      {[1, -1].map((side) => (
        <mesh
          key={`ct-${side}`}
          position={[side * 0.85, 1.44, -0.15]}
          rotation={[0, 0, side * -0.06]}
          material={mats.cabin}
        >
          <boxGeometry args={[0.04, 0.6, 2.2]} />
        </mesh>
      ))}

      {/* ============================================================ */}
      {/*  WINDOWS                                                       */}
      {/* ============================================================ */}
      {/* Windshield — angled back */}
      <mesh
        position={[0, 1.38, 0.98]}
        rotation={[0.12, 0, 0]}
        material={mats.glass}
      >
        <boxGeometry args={[1.58, 0.62, 0.04]} />
      </mesh>

      {/* Side windows — left */}
      <mesh position={[0.88, 1.36, 0.1]} material={mats.glass}>
        <boxGeometry args={[0.03, 0.52, 1.85]} />
      </mesh>

      {/* Side windows — right */}
      <mesh position={[-0.88, 1.36, 0.1]} material={mats.glass}>
        <boxGeometry args={[0.03, 0.52, 1.85]} />
      </mesh>

      {/* Rear window */}
      <mesh
        position={[0, 1.38, -1.3]}
        rotation={[-0.08, 0, 0]}
        material={mats.glass}
      >
        <boxGeometry args={[1.52, 0.54, 0.04]} />
      </mesh>

      {/* Window pillars — B-pillar (between front/rear side windows) */}
      {[1, -1].map((side) => (
        <mesh
          key={`b-pillar-${side}`}
          position={[side * 0.88, 1.36, 0.02]}
          material={mats.trim}
        >
          <boxGeometry args={[0.04, 0.56, 0.06]} />
        </mesh>
      ))}

      {/* A-pillars — windshield sides */}
      {[1, -1].map((side) => (
        <mesh
          key={`a-pillar-${side}`}
          position={[side * 0.78, 1.4, 0.92]}
          rotation={[0.12, 0, side * -0.04]}
          material={mats.cabin}
        >
          <boxGeometry args={[0.06, 0.58, 0.06]} />
        </mesh>
      ))}

      {/* C-pillar — rear window sides */}
      {[1, -1].map((side) => (
        <mesh
          key={`c-pillar-${side}`}
          position={[side * 0.78, 1.38, -1.22]}
          material={mats.cabin}
        >
          <boxGeometry args={[0.06, 0.58, 0.06]} />
        </mesh>
      ))}

      {/* ============================================================ */}
      {/*  ROOF                                                         */}
      {/* ============================================================ */}
      <mesh position={[0, 1.74, -0.15]} material={mats.trim}>
        <boxGeometry args={[1.78, 0.06, 2.4]} />
      </mesh>

      {/* Roof rail — left */}
      <mesh position={[0.78, 1.78, -0.15]} material={mats.roofRail}>
        <boxGeometry args={[0.04, 0.04, 2.1]} />
      </mesh>
      {/* Roof rail supports */}
      {[-0.8, -0.2, 0.4].map((z) => (
        <mesh key={`rr-l-${z}`} position={[0.78, 1.76, z]} material={mats.roofRail}>
          <boxGeometry args={[0.03, 0.04, 0.06]} />
        </mesh>
      ))}

      {/* Roof rail — right */}
      <mesh position={[-0.78, 1.78, -0.15]} material={mats.roofRail}>
        <boxGeometry args={[0.04, 0.04, 2.1]} />
      </mesh>
      {/* Roof rail supports */}
      {[-0.8, -0.2, 0.4].map((z) => (
        <mesh key={`rr-r-${z}`} position={[-0.78, 1.76, z]} material={mats.roofRail}>
          <boxGeometry args={[0.03, 0.04, 0.06]} />
        </mesh>
      ))}

      {/* Shark fin antenna */}
      <mesh position={[0, 1.8, -0.8]} material={mats.trim}>
        <boxGeometry args={[0.08, 0.06, 0.14]} />
      </mesh>

      {/* ============================================================ */}
      {/*  REAR BUMPER                                                   */}
      {/* ============================================================ */}
      <mesh position={[0, 0.44, -2.12]} material={mats.trim}>
        <boxGeometry args={[1.86, 0.44, 0.28]} />
      </mesh>

      {/* Rear bumper step / loading lip */}
      <mesh position={[0, 0.64, -2.16]} material={mats.chrome}>
        <boxGeometry args={[1.6, 0.025, 0.04]} />
      </mesh>

      {/* Rear diffuser */}
      <mesh position={[0, 0.26, -2.22]} material={mats.carbon}>
        <boxGeometry args={[1.4, 0.08, 0.16]} />
      </mesh>

      {/* Rear skid plate */}
      <mesh position={[0, 0.18, -2.2]} material={mats.darkChrome}>
        <boxGeometry args={[1.2, 0.04, 0.18]} />
      </mesh>

      {/* ============================================================ */}
      {/*  TAILLIGHTS                                                    */}
      {/* ============================================================ */}
      {[-0.78, 0.78].map((x) => (
        <Taillight
          key={`tl-${x}`}
          position={[x, 0.92, -2.2]}
          taillightMat={mats.taillight}
          lensMat={mats.lens}
        />
      ))}

      {/* Rear reflectors — lower */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={`ref-${x}`} position={[x, 0.32, -2.26]} material={mats.taillight}>
          <boxGeometry args={[0.12, 0.04, 0.02]} />
        </mesh>
      ))}

      {/* ============================================================ */}
      {/*  SPARE WHEEL — rear mounted (iconic G-Class)                  */}
      {/* ============================================================ */}
      <mesh position={[0, 0.94, -2.36]} rotation={[0, 0, Math.PI / 2]} material={mats.trim}>
        <cylinderGeometry args={[0.44, 0.44, 0.08, 32]} />
      </mesh>
      <mesh position={[0, 0.94, -2.38]} rotation={[0, 0, Math.PI / 2]} material={mats.rim}>
        <cylinderGeometry args={[0.28, 0.28, 0.02, 24]} />
      </mesh>
      {/* Spare wheel cover ring */}
      <mesh position={[0, 0.94, -2.35]} rotation={[0, 0, Math.PI / 2]} material={mats.chrome}>
        <torusGeometry args={[0.38, 0.02, 8, 28]} />
      </mesh>

      {/* ============================================================ */}
      {/*  RUNNING BOARDS — chrome side steps                           */}
      {/* ============================================================ */}
      {[1, -1].map((side) => (
        <group key={`rb-${side}`}>
          {/* Main board */}
          <mesh position={[side * 0.92, 0.22, 0.1]} material={mats.runningBoard}>
            <boxGeometry args={[0.14, 0.03, 2.4]} />
          </mesh>
          {/* Board edge trim */}
          <mesh position={[side * 0.98, 0.22, 0.1]} material={mats.chrome}>
            <boxGeometry args={[0.02, 0.035, 2.4]} />
          </mesh>
          {/* Board mounts */}
          {[-0.6, 0, 0.6].map((z) => (
            <mesh key={`rbm-${side}-${z}`} position={[side * 0.9, 0.28, z]} material={mats.trim}>
              <boxGeometry args={[0.06, 0.08, 0.06]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ============================================================ */}
      {/*  EXHAUST TIPS — quad Brabus-style                             */}
      {/* ============================================================ */}
      {/* Left pair */}
      <mesh position={[-0.62, 0.24, -2.28]} rotation={[Math.PI / 2, 0, 0]} material={mats.exhaust}>
        <cylinderGeometry args={[0.045, 0.05, 0.12, 16]} />
      </mesh>
      <mesh position={[-0.48, 0.24, -2.28]} rotation={[Math.PI / 2, 0, 0]} material={mats.exhaust}>
        <cylinderGeometry args={[0.045, 0.05, 0.12, 16]} />
      </mesh>
      {/* Right pair */}
      <mesh position={[0.48, 0.24, -2.28]} rotation={[Math.PI / 2, 0, 0]} material={mats.exhaust}>
        <cylinderGeometry args={[0.045, 0.05, 0.12, 16]} />
      </mesh>
      <mesh position={[0.62, 0.24, -2.28]} rotation={[Math.PI / 2, 0, 0]} material={mats.exhaust}>
        <cylinderGeometry args={[0.045, 0.05, 0.12, 16]} />
      </mesh>

      {/* ============================================================ */}
      {/*  SIDE MIRRORS                                                  */}
      {/* ============================================================ */}
      {[1, -1].map((side) => (
        <group key={`mirror-${side}`}>
          {/* Mirror stalk */}
          <mesh position={[side * 0.98, 1.22, 0.82]} material={mats.trim}>
            <boxGeometry args={[0.06, 0.06, 0.1]} />
          </mesh>
          {/* Mirror housing */}
          <mesh position={[side * 1.06, 1.24, 0.82]} material={mats.body}>
            <boxGeometry args={[0.1, 0.08, 0.14]} />
          </mesh>
          {/* Mirror glass */}
          <mesh
            position={[side * 1.02, 1.24, 0.82]}
            material={mats.glass}
          >
            <boxGeometry args={[0.02, 0.06, 0.1]} />
          </mesh>
        </group>
      ))}

      {/* ============================================================ */}
      {/*  DOOR HANDLES                                                  */}
      {/* ============================================================ */}
      {[1, -1].map((side) =>
        [0.45, -0.35].map((z) => (
          <mesh
            key={`dh-${side}-${z}`}
            position={[side * 0.97, bodyY + 0.14, z]}
            material={mats.chrome}
          >
            <boxGeometry args={[0.02, 0.025, 0.1]} />
          </mesh>
        ))
      )}

      {/* Door panel lines — subtle creases */}
      {[1, -1].map((side) => (
        <mesh
          key={`dp-${side}`}
          position={[side * 0.97, bodyY - 0.05, -0.08]}
          material={mats.darkChrome}
        >
          <boxGeometry args={[0.015, 0.65, 0.015]} />
        </mesh>
      ))}

      {/* ============================================================ */}
      {/*  WHEEL ARCH TRIMS — pronounced fender flares                  */}
      {/* ============================================================ */}
      {[
        [halfW, 0.42, axleZ],
        [-halfW, 0.42, axleZ],
        [halfW, 0.42, -axleZ],
        [-halfW, 0.42, -axleZ],
      ].map((p, i) => (
        <mesh
          key={`arch-${i}`}
          position={p as [number, number, number]}
          rotation={[0, 0, Math.PI / 2]}
          material={mats.trim}
        >
          <torusGeometry args={[0.48, 0.055, 8, 24, Math.PI]} />
        </mesh>
      ))}

      {/* ============================================================ */}
      {/*  WHEELS                                                        */}
      {/* ============================================================ */}
      {[
        [halfW, 0.44, axleZ],
        [-halfW, 0.44, axleZ],
        [halfW, 0.44, -axleZ],
        [-halfW, 0.44, -axleZ],
      ].map((p, i) => (
        <group
          key={`wheel-${i}`}
          position={p as [number, number, number]}
          ref={(el) => {
            wheelRefs.current[i] = el;
          }}
        >
          <Wheel position={[0, 0, 0]} materials={wheelMats} />
        </group>
      ))}
    </group>
  );
}
