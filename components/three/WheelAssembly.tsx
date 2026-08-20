"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";
import { localProgress } from "@/lib/constants/scroll";
import { scrollState } from "@/lib/three/scrollState";

/**
 * Hero exploded wheel for Scene 05 — photorealistic Brabus Monoblock
 * with circumferential tread grooves, Y-split tapered spokes, cross-drilled
 * brake disc with ventilation vanes, and a multi-piston caliper with
 * bleeder screws and brake line.
 */
export default function WheelAssembly() {
  const choreo = useChoreography();
  const group = useRef<THREE.Group>(null);
  const tireRef = useRef<THREE.Group>(null);
  const rimRef = useRef<THREE.Group>(null);
  const discRef = useRef<THREE.Group>(null);
  const caliperRef = useRef<THREE.Group>(null);
  const spokesRef = useRef<THREE.Group>(null);
  const hubRef = useRef<THREE.Group>(null);

  const mats = useMemo(() => {
    // Tire — deep rubber with slight sheen on sidewall
    const tireTread = new THREE.MeshStandardMaterial({ color: "#0a0a0a", metalness: 0, roughness: 0.95 });
    const tireSidewall = new THREE.MeshStandardMaterial({ color: "#0e0e0e", metalness: 0.03, roughness: 0.82 });
    const tireGroove = new THREE.MeshStandardMaterial({ color: "#050505", metalness: 0, roughness: 0.98 });

    // Rim — physical clearcoat for realistic automotive finish
    const rimBarrel = new THREE.MeshPhysicalMaterial({
      color: "#c8c8cc", metalness: 0.95, roughness: 0.12,
      clearcoat: 0.6, clearcoatRoughness: 0.1,
    });
    const rimLip = new THREE.MeshPhysicalMaterial({
      color: "#dcdce0", metalness: 0.97, roughness: 0.06,
      clearcoat: 0.8, clearcoatRoughness: 0.05,
    });
    const spokeMat = new THREE.MeshPhysicalMaterial({
      color: "#b8b8bc", metalness: 0.93, roughness: 0.18,
      clearcoat: 0.5, clearcoatRoughness: 0.12,
    });
    const spokeEdge = new THREE.MeshPhysicalMaterial({
      color: "#d0d0d4", metalness: 0.96, roughness: 0.08,
      clearcoat: 0.7, clearcoatRoughness: 0.08,
    });

    // Brake disc — scored steel look
    const discFace = new THREE.MeshStandardMaterial({ color: "#9a9aa0", metalness: 0.9, roughness: 0.28 });
    const discHat = new THREE.MeshStandardMaterial({ color: "#707078", metalness: 0.85, roughness: 0.35 });
    const discVane = new THREE.MeshStandardMaterial({ color: "#606068", metalness: 0.8, roughness: 0.4 });

    // Caliper — Brabus red with physical finish
    const caliperBody = new THREE.MeshPhysicalMaterial({
      color: "#c41818", metalness: 0.55, roughness: 0.25,
      clearcoat: 0.4, clearcoatRoughness: 0.15,
    });
    const caliperPiston = new THREE.MeshStandardMaterial({ color: "#a0a0a8", metalness: 0.9, roughness: 0.2 });
    const caliperBolt = new THREE.MeshStandardMaterial({ color: "#404048", metalness: 0.92, roughness: 0.22 });
    const brakeLine = new THREE.MeshStandardMaterial({ color: "#2a2a30", metalness: 0.7, roughness: 0.35 });

    // Hub
    const hubBody = new THREE.MeshStandardMaterial({ color: "#181820", metalness: 0.88, roughness: 0.22 });
    const hubCap = new THREE.MeshPhysicalMaterial({
      color: "#e0e0e8", metalness: 0.97, roughness: 0.06,
      clearcoat: 0.9, clearcoatRoughness: 0.04,
    });
    const bolt = new THREE.MeshStandardMaterial({ color: "#4a4a52", metalness: 0.92, roughness: 0.2 });
    const valve = new THREE.MeshStandardMaterial({ color: "#333338", metalness: 0.8, roughness: 0.3 });

    return {
      tireTread, tireSidewall, tireGroove,
      rimBarrel, rimLip, spokeMat, spokeEdge,
      discFace, discHat, discVane,
      caliperBody, caliperPiston, caliperBolt, brakeLine,
      hubBody, hubCap, bolt, valve,
    };
  }, []);

  useFrame((_, delta) => {
    const local = localProgress(scrollState.progress, "wheels");
    const explode = Math.sin(Math.min(1, local) * Math.PI);
    const s = choreo.current;

    if (group.current) {
      group.current.visible = s.wheelFocus > 0.01;
      const scale = THREE.MathUtils.lerp(0.94, 1, s.wheelFocus);
      group.current.scale.setScalar(scale);
      group.current.rotation.x -= delta * (0.15 + Math.abs(scrollState.velocity) * 6);
    }

    if (tireRef.current) tireRef.current.position.x = 0;
    if (hubRef.current) hubRef.current.position.x = explode * 0.08;
    if (rimRef.current) rimRef.current.position.x = explode * 0.16;
    if (spokesRef.current) spokesRef.current.position.x = explode * 0.24;
    if (discRef.current) discRef.current.position.x = explode * 0.42;
    if (caliperRef.current) caliperRef.current.position.x = explode * 0.58;
  });

  const R = 0.62;
  const spokeCount = 10;

  return (
    <group ref={group} position={[1.6, 0.62, 0]}>

      {/* ======== TIRE ================================================ */}
      <group ref={tireRef} rotation={[0, 0, Math.PI / 2]}>
        {/* Main tread cylinder */}
        <mesh material={mats.tireTread}>
          <cylinderGeometry args={[R, R, 0.4, 64]} />
        </mesh>
        {/* Inner barrel — darker, visible from behind */}
        <mesh material={mats.tireGroove}>
          <cylinderGeometry args={[R * 0.8, R * 0.8, 0.38, 48]} />
        </mesh>

        {/* ---- TREAD GROOVES — 4 circumferential channels ---- */}
        {[-0.14, -0.05, 0.05, 0.14].map((x, gi) => (
          <mesh key={`groove-${gi}`} position={[x, 0, 0]} material={mats.tireGroove}>
            <torusGeometry args={[R - 0.005, 0.012, 6, 64]} />
          </mesh>
        ))}
        {/* Tread shoulder edges — rounded transition */}
        {[0.2, -0.2].map((x, si) => (
          <mesh key={`shoulder-${si}`} position={[x, 0, 0]} material={mats.tireSidewall}>
            <torusGeometry args={[R * 0.97, 0.028, 10, 64]} />
          </mesh>
        ))}

        {/* ---- SIDEWALLS ---- */}
        {/* Outer sidewall — slight bulge */}
        <mesh position={[0.22, 0, 0]} material={mats.tireSidewall}>
          <torusGeometry args={[R * 0.88, 0.05, 12, 64]} />
        </mesh>
        {/* Inner sidewall */}
        <mesh position={[-0.22, 0, 0]} material={mats.tireSidewall}>
          <torusGeometry args={[R * 0.88, 0.05, 12, 64]} />
        </mesh>
        {/* Sidewall branding ring — outer */}
        <mesh position={[0.215, 0, 0]} material={mats.tireSidewall}>
          <torusGeometry args={[R * 0.78, 0.012, 8, 64]} />
        </mesh>
        {/* Sidewall branding ring — inner */}
        <mesh position={[-0.215, 0, 0]} material={mats.tireSidewall}>
          <torusGeometry args={[R * 0.78, 0.012, 8, 64]} />
        </mesh>
        {/* Bead ring — where tire seats on rim */}
        {[0.19, -0.19].map((x, bi) => (
          <mesh key={`bead-${bi}`} position={[x, 0, 0]} material={mats.tireGroove}>
            <torusGeometry args={[R * 0.74, 0.008, 8, 48]} />
          </mesh>
        ))}
      </group>

      {/* ======== RIM BARREL ========================================== */}
      <group ref={rimRef} rotation={[0, 0, Math.PI / 2]}>
        {/* Outer barrel */}
        <mesh material={mats.rimBarrel}>
          <cylinderGeometry args={[R * 0.72, R * 0.72, 0.42, 64]} />
        </mesh>
        {/* Outer lip — polished stepped profile */}
        <mesh position={[0.21, 0, 0]} material={mats.rimLip}>
          <torusGeometry args={[R * 0.72, 0.02, 12, 64]} />
        </mesh>
        {/* Lip step — inner ridge */}
        <mesh position={[0.19, 0, 0]} material={mats.rimLip}>
          <torusGeometry args={[R * 0.7, 0.008, 8, 48]} />
        </mesh>
        {/* Inner lip */}
        <mesh position={[-0.21, 0, 0]} material={mats.rimBarrel}>
          <torusGeometry args={[R * 0.72, 0.016, 10, 48]} />
        </mesh>
        {/* Barrel inner reinforcement ring */}
        <mesh material={mats.rimBarrel}>
          <torusGeometry args={[R * 0.66, 0.006, 8, 48]} />
        </mesh>
        {/* Valve stem hole area */}
        <mesh position={[0.18, R * 0.71, 0]} material={mats.valve}>
          <cylinderGeometry args={[0.008, 0.008, 0.04, 8]} />
        </mesh>
        {/* Valve stem cap */}
        <mesh position={[0.2, R * 0.71, 0]} material={mats.valve}>
          <cylinderGeometry args={[0.006, 0.007, 0.012, 8]} />
        </mesh>
      </group>

      {/* ======== Y-SPLIT SPOKES ====================================== */}
      <group ref={spokesRef} rotation={[0, 0, Math.PI / 2]}>
        {Array.from({ length: spokeCount }).map((_, i) => {
          const angle = (i * Math.PI * 2) / spokeCount;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const hubR = R * 0.2;
          const rimR = R * 0.66;

          // Y-split: two arms per spoke
          return (
            <group key={`spoke-${i}`}>
              {/* Main spoke arm — upper */}
              <mesh
                position={[0.16, sin * R * 0.44, cos * R * 0.44]}
                rotation={[angle, 0, 0]}
                material={mats.spokeMat}
              >
                <boxGeometry args={[0.032, R * 0.48, 0.042]} />
              </mesh>
              {/* Main spoke arm — lower */}
              <mesh
                position={[0.16, -sin * R * 0.44, -cos * R * 0.44]}
                rotation={[angle + Math.PI, 0, 0]}
                material={mats.spokeMat}
              >
                <boxGeometry args={[0.032, R * 0.48, 0.042]} />
              </mesh>

              {/* Spoke outer edge highlight */}
              <mesh
                position={[0.17, sin * R * 0.44, cos * R * 0.44]}
                rotation={[angle, 0, 0]}
                material={mats.spokeEdge}
              >
                <boxGeometry args={[0.008, R * 0.46, 0.01]} />
              </mesh>

              {/* Spoke widening near hub — structural base */}
              <mesh
                position={[0.1, sin * R * 0.18, cos * R * 0.18]}
                rotation={[angle, 0, 0]}
                material={mats.spokeMat}
              >
                <boxGeometry args={[0.038, R * 0.28, 0.052]} />
              </mesh>

              {/* Spoke-to-rim transition — tapered end */}
              <mesh
                position={[0.175, sin * R * 0.62, cos * R * 0.62]}
                rotation={[angle, 0, 0]}
                material={mats.spokeEdge}
              >
                <boxGeometry args={[0.025, R * 0.08, 0.03]} />
              </mesh>
            </group>
          );
        })}
        {/* Inner structural ring — where spokes meet hub */}
        <mesh material={mats.rimBarrel}>
          <torusGeometry args={[R * 0.22, 0.014, 10, 32]} />
        </mesh>
        {/* Outer structural ring — where spokes meet rim */}
        <mesh position={[0.17, 0, 0]} material={mats.rimBarrel}>
          <torusGeometry args={[R * 0.66, 0.01, 8, 48]} />
        </mesh>
      </group>

      {/* ======== HUB ================================================ */}
      <group ref={hubRef} rotation={[0, 0, Math.PI / 2]}>
        {/* Hub body — recessed barrel */}
        <mesh position={[0.17, 0, 0]} material={mats.hubBody}>
          <cylinderGeometry args={[R * 0.16, R * 0.18, 0.07, 24]} />
        </mesh>
        {/* Hub face — flat mounting surface */}
        <mesh position={[0.2, 0, 0]} material={mats.hubBody}>
          <cylinderGeometry args={[R * 0.15, R * 0.15, 0.02, 24]} />
        </mesh>
        {/* Center cap — Brabus logo dome */}
        <mesh position={[0.22, 0, 0]} material={mats.hubCap}>
          <cylinderGeometry args={[R * 0.1, R * 0.12, 0.025, 20]} />
        </mesh>
        {/* Cap dome — hemisphere */}
        <mesh position={[0.235, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.hubCap}>
          <sphereGeometry args={[R * 0.08, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        {/* Lug bolts — 5-bolt pattern */}
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 5;
          return (
            <group key={`bolt-${i}`}>
              {/* Bolt head */}
              <mesh
                position={[0.2, Math.cos(a) * R * 0.1, Math.sin(a) * R * 0.1]}
                material={mats.bolt}
              >
                <cylinderGeometry args={[0.014, 0.016, 0.035, 6]} />
              </mesh>
              {/* Bolt washer */}
              <mesh
                position={[0.215, Math.cos(a) * R * 0.1, Math.sin(a) * R * 0.1]}
                material={mats.bolt}
              >
                <cylinderGeometry args={[0.018, 0.018, 0.005, 12]} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ======== BRAKE DISC ========================================== */}
      <group ref={discRef} rotation={[0, 0, Math.PI / 2]}>
        {/* Outer disc face — scored surface */}
        <mesh position={[0.04, 0, 0]} material={mats.discFace}>
          <cylinderGeometry args={[R * 0.58, R * 0.58, 0.015, 64]} />
        </mesh>
        {/* Inner disc face */}
        <mesh position={[0.025, 0, 0]} material={mats.discFace}>
          <cylinderGeometry args={[R * 0.58, R * 0.58, 0.01, 64]} />
        </mesh>

        {/* ---- CROSS-DRILLED HOLES — spiral pattern ---- */}
        {Array.from({ length: 32 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 32 + (i % 2) * 0.06;
          const r = R * 0.38 + (i % 3) * R * 0.06;
          return (
            <mesh
              key={`drill-${i}`}
              position={[0.035, Math.cos(a) * r, Math.sin(a) * r]}
              material={mats.discVane}
            >
              <cylinderGeometry args={[0.012, 0.012, 0.018, 8]} />
            </mesh>
          );
        })}

        {/* ---- VENTILATION VANES — between disc faces ---- */}
        {Array.from({ length: 18 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 18;
          const r = R * 0.48;
          return (
            <mesh
              key={`vane-${i}`}
              position={[0.032, Math.cos(a) * r, Math.sin(a) * r]}
              rotation={[0, 0, a]}
              material={mats.discVane}
            >
              <boxGeometry args={[0.008, 0.04, 0.012]} />
            </mesh>
          );
        })}

        {/* Disc hat — center raised portion */}
        <mesh position={[0.055, 0, 0]} material={mats.discHat}>
          <cylinderGeometry args={[R * 0.18, R * 0.24, 0.03, 24]} />
        </mesh>
        {/* Hat face — flat surface */}
        <mesh position={[0.07, 0, 0]} material={mats.discHat}>
          <cylinderGeometry args={[R * 0.17, R * 0.17, 0.008, 24]} />
        </mesh>
        {/* Center bore */}
        <mesh position={[0.07, 0, 0]} material={mats.discVane}>
          <cylinderGeometry args={[R * 0.08, R * 0.08, 0.01, 16]} />
        </mesh>
      </group>

      {/* ======== CALIPER ============================================= */}
      <group ref={caliperRef}>
        {/* Main caliper body — rounded performance caliper */}
        <mesh position={[0.14, R * 0.52, 0]} material={mats.caliperBody}>
          <boxGeometry args={[0.2, 0.3, 0.28]} />
        </mesh>
        {/* Caliper top bridge — rounded */}
        <mesh position={[0.14, R * 0.66, 0]} material={mats.caliperBody}>
          <boxGeometry args={[0.22, 0.04, 0.3]} />
        </mesh>
        {/* Caliper bottom bridge */}
        <mesh position={[0.14, R * 0.36, 0]} material={mats.caliperBody}>
          <boxGeometry args={[0.22, 0.04, 0.3]} />
        </mesh>
        {/* Caliper outer face — logo area */}
        <mesh position={[0.25, R * 0.52, 0]} material={mats.caliperBody}>
          <boxGeometry args={[0.012, 0.22, 0.2]} />
        </mesh>

        {/* ---- PISTONS — 6-pot radial mount ---- */}
        {[-0.08, 0, 0.08].map((z) => (
          <group key={`piston-${z}`}>
            {/* Piston bore */}
            <mesh position={[0.16, R * 0.52, z]} material={mats.caliperPiston}>
              <cylinderGeometry args={[0.028, 0.028, 0.045, 16]} />
            </mesh>
            {/* Piston face */}
            <mesh position={[0.185, R * 0.52, z]} material={mats.caliperPiston}>
              <cylinderGeometry args={[0.024, 0.024, 0.008, 12]} />
            </mesh>
          </group>
        ))}

        {/* ---- BLEEDER SCREWS ---- */}
        {[-0.08, 0.08].map((z) => (
          <mesh key={`bleed-${z}`} position={[0.15, R * 0.64, z]} material={mats.caliperBolt}>
            <cylinderGeometry args={[0.005, 0.005, 0.015, 6]} />
          </mesh>
        ))}

        {/* ---- CALIPER MOUNTING BOLTS ---- */}
        {[-0.1, 0.1].map((z) => (
          <mesh key={`mount-${z}`} position={[0.12, R * 0.38, z]} material={mats.caliperBolt}>
            <cylinderGeometry args={[0.008, 0.008, 0.025, 6]} />
          </mesh>
        ))}

        {/* ---- BRAKE LINE — flexible hose ---- */}
        <mesh position={[0.14, R * 0.68, 0.12]} material={mats.brakeLine}>
          <cylinderGeometry args={[0.004, 0.004, 0.06, 8]} />
        </mesh>
        {/* Brake line fitting */}
        <mesh position={[0.14, R * 0.71, 0.12]} material={mats.caliperBolt}>
          <cylinderGeometry args={[0.007, 0.007, 0.012, 8]} />
        </mesh>

        {/* ---- BRAKE PAD RETENTION CLIP ---- */}
        <mesh position={[0.13, R * 0.48, 0]} material={mats.caliperBolt}>
          <boxGeometry args={[0.004, 0.006, 0.22]} />
        </mesh>
      </group>
    </group>
  );
}
