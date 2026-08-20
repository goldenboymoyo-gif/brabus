"use client";

import { useEffect, useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { MODEL_SCALE, MODEL_Y_OFFSET, MODEL_ROTATION_Y } from "@/lib/three/vehicleConfig";
import { useChoreography } from "@/lib/three/choreography";
import { paintColor, engineState } from "@/lib/three/sharedState";
import { useFrame } from "@react-three/fiber";

/* ========================================================================
 * INTERIOR NODE NAME PATTERNS
 * ======================================================================== */
const INTERIOR_PATTERNS = [
  /interior/i,
  /interiordfs/i,
  /driver_seat/i,
  /passanger_seat/i,
  /passenger_seat/i,
  /rear_seat/i,
  /steeringwheel/i,
  /steering_wheel/i,
  /shifter/i,
  /gauges/i,
  /signal.*stalk/i,
  /seat_plastic/i,
  /seat.*leather/i,
  /leatherbmp/i,
  /ptn_leather/i,
  /setlogo/i,
  /roof_button/i,
  /belt_color/i,
  /AMG_dash/i,
  /brabus_dash/i,
  /dash_skin/i,
  /RGB_int/i,
  /door_red/i,
  /door_plastic/i,
  /red_int/i,
  /int_badge/i,
  /door.*panel/i,
  /FL_door/i,
  /FR_door/i,
  /RL_door/i,
  /RR_door/i,
  /temp_[0-9]/i,
  /needle/i,
];

const HEADLIGHT_PATTERNS = [
  /headlight/i,
  /headlamp/i,
  /DRL/i,
  /LED.*strip/i,
  /front.*light/i,
  /fog.*light/i,
  /foglight/i,
];

const MIRROR_PATTERNS = [
  /mirror/i,
  /side.*glass/i,
  /L_mirror/i,
  /R_mirror/i,
];

const PAINT_PATTERNS = [
  /car_paint/i,
  /body.*paint/i,
  /paint/i,
  /Car_paint/i,
  /bodywork/i,
  /hood/i,
  /roof/i,
  /fender/i,
  /bumper/i,
  /door[^_]/i,
  /trunk/i,
  /tailgate(?!.*glass)/i,
];

function matchesAny(name: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(name));
}

function classifyMeshes(scene: THREE.Object3D) {
  const exterior: THREE.Material[] = [];
  const interior: THREE.Material[] = [];
  const screenMeshes: THREE.Mesh[] = [];
  const ambientMeshes: THREE.Mesh[] = [];
  const redAccentMeshes: THREE.Mesh[] = [];
  const headlightMeshes: THREE.Mesh[] = [];
  const paintMeshes: THREE.Mesh[] = [];
  const mirrorMeshes: THREE.Mesh[] = [];

  scene.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    const name = obj.name || "";

    // Clone material
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((m) => {
        const cloned = m.clone();
        (cloned as any).transparent = true;
        (cloned as any).depthWrite = true;
        return cloned;
      });
    } else if (mesh.material) {
      const cloned = (mesh.material as THREE.Material).clone();
      (cloned as any).transparent = true;
      (cloned as any).depthWrite = true;
      mesh.material = cloned;
    }

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const isInt = isInteriorMesh(name);

    // Headlights
    if (matchesAny(name, HEADLIGHT_PATTERNS)) {
      headlightMeshes.push(mesh);
    }

    // Paint
    if (matchesAny(name, PAINT_PATTERNS) && !isInt) {
      paintMeshes.push(mesh);
    }

    // Mirrors
    if (matchesAny(name, MIRROR_PATTERNS)) {
      mirrorMeshes.push(mesh);
    }

    mats.forEach((m) => {
      if (isInt) {
        interior.push(m);
        if (/gauges|temp_|needle|AMG_gauges/i.test(name)) {
          screenMeshes.push(mesh);
        }
        if (/RGB_int/i.test(name)) {
          ambientMeshes.push(mesh);
        }
        if (/red_int|door_red|red_b|red$/i.test(name)) {
          redAccentMeshes.push(mesh);
        }
      } else {
        exterior.push(m);
      }
    });
  });

  return { exterior, interior, screenMeshes, ambientMeshes, redAccentMeshes, headlightMeshes, paintMeshes, mirrorMeshes };
}

function isInteriorMesh(nodeName: string): boolean {
  return INTERIOR_PATTERNS.some((p) => p.test(nodeName));
}

export default function GLTFVehicle({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const choreo = useChoreography();
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);

  const exteriorMats = useRef<THREE.Material[]>([]);
  const interiorMats = useRef<THREE.Material[]>([]);
  const screenMats = useRef<THREE.Material[]>([]);
  const ambientMats = useRef<THREE.Material[]>([]);
  const redAccentMats = useRef<THREE.Material[]>([]);
  const headlightMats = useRef<Set<THREE.Material>>(new Set());
  const paintMats = useRef<Set<THREE.Material>>(new Set());
  const lastColor = useRef("");

  useEffect(() => {
    const c = classifyMeshes(scene);
    exteriorMats.current = c.exterior;
    interiorMats.current = c.interior;

    const screens = new Set<THREE.Material>();
    const ambient = new Set<THREE.Material>();
    const reds = new Set<THREE.Material>();
    c.screenMeshes.forEach((m) => {
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => screens.add(mat as THREE.Material));
    });
    c.ambientMeshes.forEach((m) => {
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => ambient.add(mat as THREE.Material));
    });
    c.redAccentMeshes.forEach((m) => {
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => reds.add(mat as THREE.Material));
    });
    screenMats.current = [...screens];
    ambientMats.current = [...ambient];
    redAccentMats.current = [...reds];

    // Headlight materials
    const hl = new Set<THREE.Material>();
    c.headlightMeshes.forEach((m) => {
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => hl.add(mat as THREE.Material));
    });
    headlightMats.current = hl;

    // Paint materials
    const pm = new Set<THREE.Material>();
    c.paintMeshes.forEach((m) => {
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => pm.add(mat as THREE.Material));
    });
    paintMats.current = pm;
  }, [scene]);

  useFrame(() => {
    const s = choreo.current;
    const bodyOp = s.bodyOpacity;
    const intFocus = s.interiorFocus;
    const isEngineOn = engineState.current;

    // Exterior fade
    exteriorMats.current.forEach((m) => {
      const mm = m as THREE.MeshStandardMaterial;
      mm.transparent = bodyOp < 0.98;
      mm.opacity = bodyOp;
      mm.depthWrite = bodyOp > 0.5;
    });

    // Interior fade in
    interiorMats.current.forEach((m) => {
      const mm = m as THREE.MeshStandardMaterial;
      mm.transparent = true;
      mm.opacity = intFocus;
      mm.depthWrite = intFocus > 0.5;
    });

    // Screen emissive
    screenMats.current.forEach((m) => {
      const mm = m as THREE.MeshStandardMaterial;
      if (mm.emissive) mm.emissiveIntensity = 0.2 + intFocus * 3.5;
    });

    // Ambient RGB glow
    ambientMats.current.forEach((m) => {
      const mm = m as THREE.MeshStandardMaterial;
      if (mm.emissive) mm.emissiveIntensity = 0.5 + intFocus * 4.0 + Math.sin(Date.now() * 0.002) * 0.3;
    });

    // Red accents
    redAccentMats.current.forEach((m) => {
      const mm = m as THREE.MeshStandardMaterial;
      if (mm.emissive) mm.emissiveIntensity = 0.1 + intFocus * 1.5;
    });

    // Headlights — always on, boost when engine starts
    const hlIntensity = 0.6 + s.headlight * 2.0 + (isEngineOn ? 1.5 : 0);
    headlightMats.current.forEach((m) => {
      const mm = m as THREE.MeshStandardMaterial;
      if (mm.emissive) {
        mm.emissiveIntensity = hlIntensity;
        mm.emissive.set(isEngineOn ? "#e8f0ff" : "#8899aa");
      }
    });

    // Paint color — update when changed
    const color = paintColor.current;
    if (color !== lastColor.current) {
      lastColor.current = color;
      paintMats.current.forEach((m) => {
        const mm = m as THREE.MeshStandardMaterial;
        mm.color.set(color);
      });
    }
  });

  return (
    <primitive
      object={scene}
      scale={MODEL_SCALE}
      position={[0, MODEL_Y_OFFSET, 0]}
      rotation={[0, MODEL_ROTATION_Y, 0]}
    />
  );
}
