"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";
import { localProgress } from "@/lib/constants/scroll";
import { scrollState } from "@/lib/three/scrollState";

/**
 * Hero exploded wheel for Scene 05 — detailed Brabus Monoblock-style
 * wheel with tire, rim barrel, rim lip, multi-spoke design, ventilated
 * brake disc, and performance caliper. Explodes apart mid-scene then
 * reunites as the scene exits.
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
    const tireM = new THREE.MeshStandardMaterial({ color: "#080808", metalness: 0, roughness: 0.92 });
    const tireWallM = new THREE.MeshStandardMaterial({ color: "#0c0c0c", metalness: 0.05, roughness: 0.85 });
    const rimM = new THREE.MeshStandardMaterial({ color: "#d8d8dc", metalness: 0.95, roughness: 0.15 });
    const rimLipM = new THREE.MeshStandardMaterial({ color: "#e0e0e4", metalness: 0.97, roughness: 0.08 });
    const spokeM = new THREE.MeshStandardMaterial({ color: "#c8c8cc", metalness: 0.92, roughness: 0.22 });
    const discM = new THREE.MeshStandardMaterial({ color: "#a0a0a4", metalness: 0.88, roughness: 0.3 });
    const discVentM = new THREE.MeshStandardMaterial({ color: "#888890", metalness: 0.85, roughness: 0.35 });
    const caliperM = new THREE.MeshStandardMaterial({ color: "#cc1a1a", metalness: 0.6, roughness: 0.28 });
    const caliperBridgeM = new THREE.MeshStandardMaterial({ color: "#b01515", metalness: 0.55, roughness: 0.32 });
    const hubM = new THREE.MeshStandardMaterial({ color: "#1a1a1e", metalness: 0.85, roughness: 0.2 });
    const hubCapM = new THREE.MeshStandardMaterial({ color: "#e8e8ec", metalness: 0.96, roughness: 0.1 });
    const boltM = new THREE.MeshStandardMaterial({ color: "#555558", metalness: 0.9, roughness: 0.25 });
    return { tireM, tireWallM, rimM, rimLipM, spokeM, discM, discVentM, caliperM, caliperBridgeM, hubM, hubCapM, boltM };
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
        {/* Main tread surface */}
        <mesh material={mats.tireM}>
          <cylinderGeometry args={[R, R, 0.4, 48]} />
        </mesh>
        {/* Tread outer edge ring */}
        <mesh position={[0.2, 0, 0]} material={mats.tireM}>
          <torusGeometry args={[R, 0.025, 12, 48]} />
        </mesh>
        {/* Tread inner edge ring */}
        <mesh position={[-0.2, 0, 0]} material={mats.tireM}>
          <torusGeometry args={[R, 0.025, 12, 48]} />
        </mesh>
        {/* Sidewall outer bulge */}
        <mesh position={[0.22, 0, 0]} material={mats.tireWallM}>
          <torusGeometry args={[R * 0.92, 0.04, 10, 48]} />
        </mesh>
        {/* Sidewall inner bulge */}
        <mesh position={[-0.22, 0, 0]} material={mats.tireWallM}>
          <torusGeometry args={[R * 0.92, 0.04, 10, 48]} />
        </mesh>
        {/* Sidewall text ring — outer */}
        <mesh position={[0.21, 0, 0]} material={mats.tireWallM}>
          <torusGeometry args={[R * 0.85, 0.015, 8, 48]} />
        </mesh>
        {/* Inner barrel shadow */}
        <mesh material={mats.tireM}>
          <cylinderGeometry args={[R * 0.82, R * 0.82, 0.38, 48]} />
        </mesh>
      </group>

      {/* ======== RIM BARREL ========================================== */}
      <group ref={rimRef} rotation={[0, 0, Math.PI / 2]}>
        {/* Outer barrel */}
        <mesh material={mats.rimM}>
          <cylinderGeometry args={[R * 0.72, R * 0.72, 0.42, 48]} />
        </mesh>
        {/* Outer lip — polished ring */}
        <mesh position={[0.21, 0, 0]} material={mats.rimLipM}>
          <torusGeometry args={[R * 0.72, 0.018, 10, 48]} />
        </mesh>
        {/* Inner lip */}
        <mesh position={[-0.21, 0, 0]} material={mats.rimM}>
          <torusGeometry args={[R * 0.72, 0.014, 8, 48]} />
        </mesh>
        {/* Inner barrel detail ring */}
        <mesh position={[0, 0, 0]} material={mats.rimM}>
          <torusGeometry args={[R * 0.68, 0.008, 8, 48]} />
        </mesh>
      </group>

      {/* ======== SPOKES =============================================== */}
      <group ref={spokesRef} rotation={[0, 0, Math.PI / 2]}>
        {Array.from({ length: spokeCount }).map((_, i) => {
          const angle = (i * Math.PI * 2) / spokeCount;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const spokeLen = R * 0.56;
          return (
            <group key={`spoke-${i}`}>
              {/* Main spoke bar */}
              <mesh
                position={[0.17, sin * R * 0.36, cos * R * 0.36]}
                rotation={[angle, 0, 0]}
                material={mats.spokeM}
              >
                <boxGeometry args={[0.035, spokeLen, 0.05]} />
              </mesh>
              {/* Spoke chamfer — top edge */}
              <mesh
                position={[0.175, sin * R * 0.36, cos * R * 0.36]}
                rotation={[angle, 0, 0]}
                material={mats.rimLipM}
              >
                <boxGeometry args={[0.015, spokeLen * 0.9, 0.012]} />
              </mesh>
              {/* Spoke widening near hub */}
              <mesh
                position={[0.12, sin * R * 0.22, cos * R * 0.22]}
                rotation={[angle, 0, 0]}
                material={mats.spokeM}
              >
                <boxGeometry args={[0.04, spokeLen * 0.35, 0.06]} />
              </mesh>
            </group>
          );
        })}
        {/* Inner spoke ring — structural ring connecting all spokes */}
        <mesh material={mats.rimM}>
          <torusGeometry args={[R * 0.36, 0.012, 8, 32]} />
        </mesh>
        {/* Outer spoke ring — near rim lip */}
        <mesh position={[0.17, 0, 0]} material={mats.rimM}>
          <torusGeometry args={[R * 0.68, 0.01, 8, 32]} />
        </mesh>
      </group>

      {/* ======== HUB ================================================ */}
      <group ref={hubRef} rotation={[0, 0, Math.PI / 2]}>
        {/* Center hub body */}
        <mesh position={[0.18, 0, 0]} material={mats.hubM}>
          <cylinderGeometry args={[R * 0.14, R * 0.14, 0.06, 24]} />
        </mesh>
        {/* Center cap — Brabus emblem area */}
        <mesh position={[0.21, 0, 0]} material={mats.hubCapM}>
          <cylinderGeometry args={[R * 0.1, R * 0.12, 0.02, 20]} />
        </mesh>
        {/* Center cap dome */}
        <mesh position={[0.22, 0, 0]} material={mats.hubCapM}>
          <sphereGeometry args={[R * 0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        {/* Lug bolts — 5 pattern */}
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 5;
          return (
            <mesh
              key={`bolt-${i}`}
              position={[0.19, Math.cos(a) * R * 0.09, Math.sin(a) * R * 0.09]}
              rotation={[0, 0, 0]}
              material={mats.boltM}
            >
              <cylinderGeometry args={[0.012, 0.014, 0.03, 8]} />
            </mesh>
          );
        })}
      </group>

      {/* ======== BRAKE DISC ========================================== */}
      <group ref={discRef} rotation={[0, 0, Math.PI / 2]}>
        {/* Main disc surface */}
        <mesh position={[0.04, 0, 0]} material={mats.discM}>
          <cylinderGeometry args={[R * 0.58, R * 0.58, 0.018, 48]} />
        </mesh>
        {/* Ventilated disc — outer ring of holes */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 24;
          const r = R * 0.46;
          return (
            <mesh
              key={`vent-${i}`}
              position={[0.04, Math.cos(a) * r, Math.sin(a) * r]}
              material={mats.discVentM}
            >
              <cylinderGeometry args={[0.018, 0.018, 0.02, 8]} />
            </mesh>
          );
        })}
        {/* Ventilated disc — inner ring of holes */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 16;
          const r = R * 0.34;
          return (
            <mesh
              key={`vent-in-${i}`}
              position={[0.04, Math.cos(a) * r, Math.sin(a) * r]}
              material={mats.discVentM}
            >
              <cylinderGeometry args={[0.014, 0.014, 0.02, 8]} />
            </mesh>
          );
        })}
        {/* Disc hat — center raised portion */}
        <mesh position={[0.06, 0, 0]} material={mats.discM}>
          <cylinderGeometry args={[R * 0.18, R * 0.22, 0.025, 24]} />
        </mesh>
        {/* Ventilation ring groove */}
        <mesh position={[0.04, 0, 0]} material={mats.discVentM}>
          <torusGeometry args={[R * 0.42, 0.012, 8, 32]} />
        </mesh>
      </group>

      {/* ======== CALIPER ============================================= */}
      <group ref={caliperRef}>
        {/* Main caliper body — multi-pot performance caliper */}
        <mesh position={[0.14, R * 0.55, 0]} material={mats.caliperM}>
          <boxGeometry args={[0.22, 0.32, 0.26]} />
        </mesh>
        {/* Caliper bridge — top clamp */}
        <mesh position={[0.14, R * 0.55, 0]} material={mats.caliperBridgeM}>
          <boxGeometry args={[0.24, 0.06, 0.28]} />
        </mesh>
        {/* Caliper bridge — bottom clamp */}
        <mesh position={[0.14, R * 0.38, 0]} material={mats.caliperBridgeM}>
          <boxGeometry args={[0.24, 0.04, 0.28]} />
        </mesh>
        {/* Caliper pistons — visible through opening */}
        {[-0.06, 0.06].map((z) => (
          <mesh key={`piston-${z}`} position={[0.16, R * 0.52, z]} material={mats.rimM}>
            <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
          </mesh>
        ))}
        {/* Caliper logo area — flat face */}
        <mesh position={[0.26, R * 0.55, 0]} material={mats.caliperM}>
          <boxGeometry args={[0.01, 0.2, 0.18]} />
        </mesh>
        {/* Brake pad indicator line */}
        <mesh position={[0.13, R * 0.48, 0]} material={mats.discVentM}>
          <boxGeometry args={[0.005, 0.008, 0.2]} />
        </mesh>
      </group>
    </group>
  );
}
