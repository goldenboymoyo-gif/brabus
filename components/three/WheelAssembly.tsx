"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";
import { localProgress } from "@/lib/constants/scroll";
import { scrollState } from "@/lib/three/scrollState";

/**
 * Hero exploded wheel for Scene 05 — tire / rim / disc / caliper separate
 * into 3D space as the scene enters, hold apart mid-scene, then reunite as
 * it exits. Lives at a fixed world position the camera path focuses on.
 */
export default function WheelAssembly() {
  const choreo = useChoreography();
  const group = useRef<THREE.Group>(null);
  const tire = useRef<THREE.Group>(null);
  const rim = useRef<THREE.Group>(null);
  const disc = useRef<THREE.Group>(null);
  const caliper = useRef<THREE.Group>(null);
  const spokes = useRef<THREE.Group>(null);

  const mats = useMemo(() => {
    const rimM = new THREE.MeshStandardMaterial({ color: "#dcdcdc", metalness: 0.92, roughness: 0.2 });
    const tireM = new THREE.MeshStandardMaterial({ color: "#070707", metalness: 0, roughness: 0.9 });
    const discM = new THREE.MeshStandardMaterial({ color: "#a8a8a8", metalness: 0.88, roughness: 0.25 });
    const caliperM = new THREE.MeshStandardMaterial({ color: "#303032", metalness: 0.5, roughness: 0.4 });
    const spokeM = new THREE.MeshStandardMaterial({ color: "#c9c9c9", metalness: 0.9, roughness: 0.28 });
    return { rimM, tireM, discM, caliperM, spokeM };
  }, []);

  useFrame((_, delta) => {
    const local = localProgress(scrollState.progress, "wheels");
    // 0 -> 1 -> 0 envelope: apart mid-scene, together at the edges.
    const explode = Math.sin(Math.min(1, local) * Math.PI);
    const s = choreo.current;

    if (group.current) {
      group.current.visible = s.wheelFocus > 0.01;
      const scale = THREE.MathUtils.lerp(0.94, 1, s.wheelFocus);
      group.current.scale.setScalar(scale);
      group.current.rotation.x -= delta * (0.15 + Math.abs(scrollState.velocity) * 6);
    }

    if (tire.current) tire.current.position.x = 0;
    if (rim.current) rim.current.position.x = explode * 0.16;
    if (disc.current) disc.current.position.x = explode * 0.42;
    if (caliper.current) caliper.current.position.x = explode * 0.58;
    if (spokes.current) spokes.current.position.x = explode * 0.28;
  });

  const radius = 0.62;

  return (
    <group ref={group} position={[1.6, 0.62, 0]}>
      <group ref={tire} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={mats.tireM}>
          <cylinderGeometry args={[radius, radius, 0.42, 32]} />
        </mesh>
      </group>
      <group ref={rim} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={mats.rimM}>
          <cylinderGeometry args={[radius * 0.58, radius * 0.58, 0.44, 24]} />
        </mesh>
      </group>
      <group ref={spokes} rotation={[0, 0, Math.PI / 2]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh
            key={i}
            material={mats.spokeM}
            rotation={[0, 0, (i * Math.PI * 2) / 6]}
            position={[0, radius * 0.32, 0]}
          >
            <boxGeometry args={[0.06, radius * 0.62, 0.08]} />
          </mesh>
        ))}
      </group>
      <group ref={disc} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={mats.discM}>
          <cylinderGeometry args={[radius * 0.7, radius * 0.7, 0.03, 28]} />
        </mesh>
      </group>
      <group ref={caliper}>
        <mesh position={[0.14, radius * 0.55, 0]} material={mats.caliperM}>
          <boxGeometry args={[0.2, 0.3, 0.24]} />
        </mesh>
      </group>
    </group>
  );
}
