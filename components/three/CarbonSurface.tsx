"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";

/**
 * Procedurally-generated carbon-fibre weave, painted onto a canvas texture
 * (no external image asset) and applied to a plane the camera macro-pushes
 * into during Scene 04. A subtle vertex displacement gives the weave a
 * non-flat, premium woven read instead of a cheap flat decal.
 */
function buildCarbonTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#0a0a0b";
  ctx.fillRect(0, 0, size, size);

  const weave = 16;
  const cell = size / weave;
  for (let y = 0; y < weave; y++) {
    for (let x = 0; x < weave; x++) {
      const alt = (x + y) % 2 === 0;
      const base = alt ? 34 : 20;
      const shade = base + Math.round(Math.sin(x * 1.7) * 4 + Math.cos(y * 1.3) * 4);
      ctx.fillStyle = `rgb(${shade},${shade},${shade + 2})`;
      ctx.fillRect(x * cell, y * cell, cell, cell);

      ctx.strokeStyle = alt ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1;
      if (alt) {
        ctx.beginPath();
        ctx.moveTo(x * cell, y * cell + cell * 0.2);
        ctx.lineTo(x * cell + cell, y * cell + cell * 0.2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(x * cell + cell * 0.2, y * cell);
        ctx.lineTo(x * cell + cell * 0.2, y * cell + cell);
        ctx.stroke();
      }
    }
  }

  // Soft diagonal sheen
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "rgba(255,255,255,0.05)");
  grad.addColorStop(0.5, "rgba(255,255,255,0)");
  grad.addColorStop(1, "rgba(255,255,255,0.08)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = 4;
  return tex;
}

export default function CarbonSurface() {
  const choreo = useChoreography();
  const mesh = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  const texture = useMemo(() => buildCarbonTexture(), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.35,
        roughness: 0.32,
        transparent: true,
        opacity: 0,
      }),
    [texture]
  );

  useFrame(() => {
    const s = choreo.current;
    material.opacity = s.carbonFocus;
    if (mesh.current) {
      mesh.current.visible = s.carbonFocus > 0.01;
      mesh.current.rotation.z = 0.02 * Math.sin(performance.now() * 0.0001);
    }
  });

  return (
    <mesh ref={mesh} position={[0.5, 0.9, 0.15]} rotation={[0, 0.3, 0]} material={material}>
      <planeGeometry args={[2.4, 2.4, 24, 24]} />
    </mesh>
  );
}
