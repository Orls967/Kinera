import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { FourWdMode, VehicleConfiguration } from '../types/kinera';

interface PowerFlowOverlayProps {
  config: VehicleConfiguration;
  visible: boolean;
  regenMode?: boolean;
  fourWdMode?: FourWdMode;
  speedMultiplier?: number;
}

interface FlowBranch {
  id: string;
  points: [number, number, number][];
}

export function PowerFlowOverlay({
  config,
  visible,
  regenMode = false,
  fourWdMode = '4H',
  speedMultiplier = 1,
}: PowerFlowOverlayProps) {
  const pulseGroupRef = useRef<THREE.Group>(null);
  const halfL = config.specification.wheelbaseM * 0.5;
  const halfT = config.specification.trackWidthM * 0.5;
  const rEff = config.specification.tireEffectiveRadiusM;

  const branches = useMemo<FlowBranch[]>(() => {
    const out: FlowBranch[] = [];
    if (config.id === 'vehicle.config.ice-fwd') {
      out.push({
        id: 'ice-fwd-main',
        points: [
          [0, 0.58, halfL + 0.05],
          [0.12, 0.45, halfL],
          [0, rEff, halfL],
        ],
      });
      out.push({
        id: 'ice-fwd-l',
        points: [
          [0, rEff, halfL],
          [halfT * 0.9, rEff, halfL],
        ],
      });
      out.push({
        id: 'ice-fwd-r',
        points: [
          [0, rEff, halfL],
          [-halfT * 0.9, rEff, halfL],
        ],
      });
    } else if (config.id === 'vehicle.config.ice-rwd') {
      out.push({
        id: 'ice-rwd-spine',
        points: [
          [0, 0.54, halfL - 0.1],
          [0, 0.42, halfL - 0.55],
          [0, 0.36, 0],
          [0, rEff, -halfL],
        ],
      });
      out.push({ id: 'ice-rwd-l', points: [[0, rEff, -halfL], [halfT * 0.9, rEff, -halfL]] });
      out.push({ id: 'ice-rwd-r', points: [[0, rEff, -halfL], [-halfT * 0.9, rEff, -halfL]] });
    } else if (config.id === 'vehicle.config.ice-awd' || config.id === 'vehicle.config.ice-4wd') {
      const frontEngaged = config.id === 'vehicle.config.ice-awd' || fourWdMode !== '2H';
      out.push({
        id: 'center-feed',
        points: [
          [0, 0.56, halfL - 0.1],
          [0, 0.42, halfL - 0.55],
          [0, 0.37, 0.1],
        ],
      });
      out.push({
        id: 'rear-branch',
        points: [
          [0, 0.37, 0.1],
          [0, rEff, -halfL],
        ],
      });
      out.push({ id: 'rl', points: [[0, rEff, -halfL], [halfT * 0.9, rEff, -halfL]] });
      out.push({ id: 'rr', points: [[0, rEff, -halfL], [-halfT * 0.9, rEff, -halfL]] });
      if (frontEngaged) {
        out.push({
          id: 'front-branch',
          points: [
            [0, 0.37, 0.1],
            [0.08, 0.34, halfL],
            [0, rEff, halfL],
          ],
        });
        out.push({ id: 'fl', points: [[0, rEff, halfL], [halfT * 0.9, rEff, halfL]] });
        out.push({ id: 'fr', points: [[0, rEff, halfL], [-halfT * 0.9, rEff, halfL]] });
      }
    } else if (config.id === 'vehicle.config.ev-fwd') {
      out.push({
        id: 'ev-fwd-dc',
        points: [
          [0, 0.22, 0],
          [0, 0.36, halfL - 0.35],
          [0, rEff, halfL],
        ],
      });
      out.push({ id: 'ev-fl', points: [[0, rEff, halfL], [halfT * 0.9, rEff, halfL]] });
      out.push({ id: 'ev-fr', points: [[0, rEff, halfL], [-halfT * 0.9, rEff, halfL]] });
    } else if (config.id === 'vehicle.config.ev-rwd') {
      out.push({
        id: 'ev-rwd-dc',
        points: [
          [0, 0.22, 0],
          [0, 0.36, -halfL + 0.35],
          [0, rEff, -halfL],
        ],
      });
      out.push({ id: 'ev-rl', points: [[0, rEff, -halfL], [halfT * 0.9, rEff, -halfL]] });
      out.push({ id: 'ev-rr', points: [[0, rEff, -halfL], [-halfT * 0.9, rEff, -halfL]] });
    } else {
      // EV-DUAL-AWD
      out.push({
        id: 'ev-dual-f',
        points: [
          [0, 0.22, 0.15],
          [0, 0.36, halfL - 0.35],
          [0, rEff, halfL],
        ],
      });
      out.push({
        id: 'ev-dual-r',
        points: [
          [0, 0.22, -0.15],
          [0, 0.36, -halfL + 0.35],
          [0, rEff, -halfL],
        ],
      });
      out.push({ id: 'ev-dfl', points: [[0, rEff, halfL], [halfT * 0.9, rEff, halfL]] });
      out.push({ id: 'ev-dfr', points: [[0, rEff, halfL], [-halfT * 0.9, rEff, halfL]] });
      out.push({ id: 'ev-drl', points: [[0, rEff, -halfL], [halfT * 0.9, rEff, -halfL]] });
      out.push({ id: 'ev-drr', points: [[0, rEff, -halfL], [-halfT * 0.9, rEff, -halfL]] });
    }
    return out;
  }, [config.id, fourWdMode, halfL, halfT, rEff]);

  const curves = useMemo(
    () =>
      branches.map((b) => {
        const vecs = b.points.map((p) => new THREE.Vector3(...p));
        const curve = new THREE.CatmullRomCurve3(vecs);
        return {
          id: b.id,
          curve,
          tubeGeo: new THREE.TubeGeometry(curve, 18, 0.016, 6, false),
        };
      }),
    [branches],
  );

  useFrame(({ clock }) => {
    if (!visible || !pulseGroupRef.current) return;
    const tBase = clock.getElapsedTime() * 0.65 * speedMultiplier;
    pulseGroupRef.current.children.forEach((child, idx) => {
      const curveObj = curves[idx % curves.length];
      if (!curveObj) return;
      let u = (tBase + (idx * 0.37)) % 1;
      if (regenMode) u = 1 - u;
      const pt = curveObj.curve.getPointAt(u);
      child.position.copy(pt);
    });
  });

  if (!visible) return null;
  const flowColor = regenMode ? '#10B981' : config.powertrainType === 'ev' ? '#00E5FF' : '#F59E0B';

  return (
    <group name="PowerFlowOverlayGroup">
      {curves.map((c) => (
        <mesh key={c.id} geometry={c.tubeGeo}>
          <meshStandardMaterial
            color={flowColor}
            emissive={flowColor}
            emissiveIntensity={0.85}
            transparent
            opacity={0.78}
          />
        </mesh>
      ))}
      <group ref={pulseGroupRef}>
        {curves.flatMap((c) =>
          [0, 1].map((n) => (
            <mesh key={`${c.id}-p-${n}`}>
              <sphereGeometry args={[0.032, 10, 10]} />
              <meshStandardMaterial
                color="#FFFFFF"
                emissive={flowColor}
                emissiveIntensity={1.6}
              />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}
