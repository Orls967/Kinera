import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useKineraStore } from '../store/useKineraStore';
import type { CameraPresetId } from '../types/kinera';

const PRESET_MAP: Record<
  CameraPresetId,
  { pos: [number, number, number]; target: [number, number, number]; fov: number }
> = {
  'isometric-front': { pos: [3.4, 1.75, 3.6], target: [0, 0.52, 0], fov: 40 },
  'side-profile': { pos: [5.0, 0.85, 0.0], target: [0, 0.55, 0], fov: 35 },
  'top-plan': { pos: [0, 5.8, 0.05], target: [0, 0.4, 0], fov: 36 },
  'front-axle': { pos: [1.9, 0.88, 2.15], target: [0, 0.42, 1.35], fov: 38 },
  'rear-axle': { pos: [1.9, 0.88, -2.15], target: [0, 0.42, -1.35], fov: 38 },
  'underbody-drivetrain': { pos: [2.7, 0.58, 2.15], target: [0, 0.3, 0], fov: 40 },
  'powertrain-focus': { pos: [1.55, 0.95, 1.5], target: [0, 0.5, 0.9], fov: 36 },
};

export function CameraRig({
  autoRotate = false,
}: {
  autoRotate?: boolean;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera } = useThree();
  const cameraPreset = useKineraStore((s) => s.cameraPreset);
  const cameraPresetTrigger = useKineraStore((s) => s.cameraPresetTrigger);
  const activeConfigId = useKineraStore((s) => s.activeConfigId);

  const desiredPos = useRef(new THREE.Vector3(3.4, 1.75, 3.6));
  const desiredTarget = useRef(new THREE.Vector3(0, 0.52, 0));
  const animating = useRef(false);

  useEffect(() => {
    let spec = PRESET_MAP[cameraPreset] ?? PRESET_MAP['isometric-front'];
    if (cameraPreset === 'powertrain-focus') {
      if (activeConfigId === 'vehicle.config.ev-rwd') {
        spec = { pos: [1.65, 0.85, -1.7], target: [0, 0.35, -1.2], fov: 36 };
      } else if (activeConfigId === 'vehicle.config.ev-dual-awd') {
        spec = { pos: [2.5, 1.3, 0.2], target: [0, 0.35, 0], fov: 40 };
      }
    }
    desiredPos.current.set(...spec.pos);
    desiredTarget.current.set(...spec.target);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = spec.fov;
      camera.updateProjectionMatrix();
    }
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      camera.position.copy(desiredPos.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(desiredTarget.current);
        controlsRef.current.update();
      }
      animating.current = false;
    } else {
      animating.current = true;
    }
  }, [cameraPreset, cameraPresetTrigger, activeConfigId, camera]);

  useFrame((_, delta) => {
    if (!animating.current || !controlsRef.current) return;
    const alpha = Math.min(1, delta * 6.5);
    camera.position.lerp(desiredPos.current, alpha);
    controlsRef.current.target.lerp(desiredTarget.current, alpha);
    controlsRef.current.update();
    if (
      camera.position.distanceTo(desiredPos.current) < 0.02 &&
      controlsRef.current.target.distanceTo(desiredTarget.current) < 0.02
    ) {
      animating.current = false;
    }
  });

  const maxPolar =
    cameraPreset === 'underbody-drivetrain' ? Math.PI * 0.85 : (88 * Math.PI) / 180;

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={0.6}
      maxDistance={12.0}
      maxPolarAngle={maxPolar}
      autoRotate={autoRotate}
      autoRotateSpeed={0.9}
      onStart={() => {
        animating.current = false;
      }}
    />
  );
}
