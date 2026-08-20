"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useChoreography } from "@/lib/three/choreography";

/**
 * Moves the camera along the sampled choreography path every frame, but
 * never snaps directly to it — position/lookAt/fov are all critically
 * damped toward the target so fast scrubbing still reads as one smooth,
 * continuous camera move rather than a series of cuts.
 */
export default function CameraRig() {
  const choreo = useChoreography();
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0.8, 0));
  const initialized = useRef(false);

  useFrame((_, delta) => {
    const s = choreo.current;
    const persp = camera as THREE.PerspectiveCamera;

    if (!initialized.current) {
      camera.position.copy(s.pos);
      lookTarget.current.copy(s.look);
      persp.fov = s.fov;
      persp.updateProjectionMatrix();
      initialized.current = true;
    }

    // Critically-damped smoothing — frame-rate independent.
    const posLambda = 3.2;
    const lookLambda = 4.2;
    const fovLambda = 3.6;
    const posK = 1 - Math.exp(-posLambda * delta);
    const lookK = 1 - Math.exp(-lookLambda * delta);
    const fovK = 1 - Math.exp(-fovLambda * delta);

    camera.position.lerp(s.pos, posK);
    lookTarget.current.lerp(s.look, lookK);
    camera.lookAt(lookTarget.current);

    persp.fov = THREE.MathUtils.lerp(persp.fov, s.fov, fovK);
    persp.updateProjectionMatrix();
  });

  return null;
}
