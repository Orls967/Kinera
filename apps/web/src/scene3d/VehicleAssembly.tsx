import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { type ReactNode, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { COMPONENT_BY_ID } from '../data/components';
import { useKineraStore } from '../store/useKineraStore';
import type { SystemLayerId, VehicleConfiguration } from '../types/kinera';
import { createHelixCoilGeometry, getHighlightEmissive, type HighlightState } from './materials';
import { PowerFlowOverlay } from './PowerFlowOverlay';

interface CadPartProps {
  canonicalId: string;
  layer: SystemLayerId;
  explodeVec?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  clipPlane?: THREE.Plane | null;
  clippable?: boolean;
  highlightState: HighlightState;
  children: ReactNode;
}

function CadPart({
  canonicalId,
  layer,
  explodeVec = [0, 0, 0],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  highlightState,
  children,
}: CadPartProps) {
  const groupRef = useRef<THREE.Group>(null);
  const visibleLayers = useKineraStore((s) => s.visibleLayers);
  const selectComponent = useKineraStore((s) => s.selectComponent);
  const hoverComponent = useKineraStore((s) => s.hoverComponent);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const ef = useKineraStore.getState().explodeFactor;
    const tx = position[0] + explodeVec[0] * ef;
    const ty = position[1] + explodeVec[1] * ef;
    const tz = position[2] + explodeVec[2] * ef;
    const alpha = Math.min(1, delta * 10);
    groupRef.current.position.x += (tx - groupRef.current.position.x) * alpha;
    groupRef.current.position.y += (ty - groupRef.current.position.y) * alpha;
    groupRef.current.position.z += (tz - groupRef.current.position.z) * alpha;
  });

  const hi = getHighlightEmissive(canonicalId, highlightState);
  if (!visibleLayers[layer] || hi.hidden) return null;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectComponent(canonicalId);
  };
  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hoverComponent(canonicalId);
    document.body.style.cursor = 'pointer';
  };
  const handleOut = () => {
    hoverComponent(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      userData={{ canonicalId }}
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      {children}
    </group>
  );
}

function createBodyShellGeometry(is4wd: boolean, wheelbase: number): THREE.ExtrudeGeometry {
  const halfL = wheelbase * 0.5;
  const frontOverhang = halfL + 0.78;
  const rearOverhang = -halfL - 0.72;
  const shape = new THREE.Shape();
  const roofH = is4wd ? 1.72 : 1.42;
  const hoodH = is4wd ? 1.06 : 0.84;
  const beltH = is4wd ? 1.08 : 0.92;
  const rockerY = is4wd ? 0.34 : 0.22;

  shape.moveTo(rearOverhang, rockerY + 0.08);
  shape.lineTo(frontOverhang - 0.08, rockerY);
  shape.quadraticCurveTo(frontOverhang + 0.04, rockerY + 0.25, frontOverhang - 0.02, hoodH * 0.78);
  shape.quadraticCurveTo(frontOverhang - 0.15, hoodH, halfL - 0.35, hoodH + 0.05);
  shape.lineTo(halfL - 0.72, roofH - 0.04);
  shape.quadraticCurveTo(0, roofH + 0.05, -halfL + 0.38, roofH - 0.05);
  shape.lineTo(rearOverhang + 0.14, beltH + 0.12);
  shape.quadraticCurveTo(rearOverhang - 0.04, beltH - 0.1, rearOverhang, rockerY + 0.08);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 1.54,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.06,
    bevelThickness: 0.06,
  });
  // Rotate so X-profile (length) lies along +Z forward and depth lies centered on X
  geo.rotateY(-Math.PI / 2);
  geo.translate(0.77, 0, 0);
  geo.computeVertexNormals();
  return geo;
}

interface Inline4Props {
  transverse: boolean;
  highlightState: HighlightState;
  clipPlanes: THREE.Plane[];
  spinRate: number;
  basePos: [number, number, number];
}

function Inline4CutawayEngine({
  transverse,
  highlightState,
  clipPlanes,
  spinRate,
  basePos,
}: Inline4Props) {
  const crankRef = useRef<THREE.Group>(null);
  const pistonRefs = useRef<(THREE.Mesh | null)[]>([null, null, null, null]);
  const rodRefs = useRef<(THREE.Mesh | null)[]>([null, null, null, null]);
  const camRef = useRef<THREE.Mesh>(null);

  const phaseOffsets = [0, Math.PI, Math.PI, 0];

  useFrame(({ clock }) => {
    const theta = clock.getElapsedTime() * spinRate;
    if (crankRef.current) crankRef.current.rotation.z = theta;
    if (camRef.current) camRef.current.rotation.z = theta * 0.5;
    const crankR = 0.042;
    for (let i = 0; i < 4; i++) {
      const ang = theta + phaseOffsets[i];
      const py = Math.cos(ang) * crankR;
      const px = Math.sin(ang) * crankR * 0.35;
      const pMesh = pistonRefs.current[i];
      const rMesh = rodRefs.current[i];
      if (pMesh) pMesh.position.y = 0.06 + py;
      if (rMesh) {
        rMesh.position.y = -0.02 + py * 0.5;
        rMesh.rotation.z = -px * 3.5;
      }
    }
  });

  const rot: [number, number, number] = transverse ? [0, Math.PI / 2, 0] : [0, 0, 0];
  const blockHi = getHighlightEmissive('ice.engine.block', highlightState);
  const headHi = getHighlightEmissive('ice.engine.cylinder-head', highlightState);
  const pistonHi = getHighlightEmissive('ice.engine.piston', highlightState);
  const rodHi = getHighlightEmissive('ice.engine.connecting-rod', highlightState);
  const crankHi = getHighlightEmissive('ice.engine.crankshaft', highlightState);
  const valveHi = getHighlightEmissive('ice.engine.valvetrain', highlightState);
  const intakeHi = getHighlightEmissive('ice.intake.manifold', highlightState);
  const exhaustHi = getHighlightEmissive('ice.exhaust.manifold-system', highlightState);
  const coolHi = getHighlightEmissive('ice.cooling.radiator-loop', highlightState);

  return (
    <group position={basePos} rotation={rot}>
      {/* Cylinder Block Cutaway */}
      <CadPart canonicalId="ice.engine.block" layer="powerplant" explodeVec={[0, 0.25, 0]} highlightState={highlightState}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.24, 0.24, 0.48]} />
          <meshStandardMaterial
            color="#64748B"
            metalness={0.7}
            roughness={0.35}
            transparent
            opacity={0.42 * blockHi.opacityMul}
            emissive={blockHi.color}
            emissiveIntensity={blockHi.intensity}
            clippingPlanes={clipPlanes}
          />
        </mesh>
      </CadPart>

      {/* Cylinder Head */}
      <CadPart canonicalId="ice.engine.cylinder-head" layer="powerplant" explodeVec={[0, 0.52, 0]} highlightState={highlightState}>
        <mesh position={[0, 0.19, 0]} castShadow>
          <boxGeometry args={[0.26, 0.1, 0.49]} />
          <meshStandardMaterial
            color="#94A3B8"
            metalness={0.75}
            roughness={0.28}
            transparent
            opacity={0.62 * headHi.opacityMul}
            emissive={headHi.color}
            emissiveIntensity={headHi.intensity}
            clippingPlanes={clipPlanes}
          />
        </mesh>
      </CadPart>

      {/* 4 Pistons & Connecting Rods */}
      {[-0.165, -0.055, 0.055, 0.165].map((zOff, idx) => (
        <group key={`cyl-${idx}`} position={[0, 0, zOff]}>
          <CadPart canonicalId="ice.engine.piston" layer="powerplant" explodeVec={[0, 0.36, 0]} highlightState={highlightState}>
            <mesh
              ref={(el) => {
                pistonRefs.current[idx] = el;
              }}
              position={[0, 0.06, 0]}
            >
              <cylinderGeometry args={[0.041, 0.041, 0.055, 16]} />
              <meshStandardMaterial
                color="#CBD5E1"
                metalness={0.85}
                roughness={0.22}
                emissive={pistonHi.color}
                emissiveIntensity={pistonHi.intensity}
              />
            </mesh>
          </CadPart>
          <CadPart canonicalId="ice.engine.connecting-rod" layer="powerplant" explodeVec={[0, 0.18, 0]} highlightState={highlightState}>
            <mesh
              ref={(el) => {
                rodRefs.current[idx] = el;
              }}
              position={[0, -0.02, 0]}
            >
              <boxGeometry args={[0.018, 0.12, 0.02]} />
              <meshStandardMaterial
                color="#F59E0B"
                metalness={0.6}
                roughness={0.32}
                emissive={rodHi.color}
                emissiveIntensity={rodHi.intensity}
              />
            </mesh>
          </CadPart>
        </group>
      ))}

      {/* Crankshaft */}
      <CadPart canonicalId="ice.engine.crankshaft" layer="powerplant" explodeVec={[0, -0.18, 0]} highlightState={highlightState}>
        <group ref={crankRef} position={[0, -0.08, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.54, 14]} />
            <meshStandardMaterial
              color="#E2E8F0"
              metalness={0.9}
              roughness={0.18}
              emissive={crankHi.color}
              emissiveIntensity={crankHi.intensity}
            />
          </mesh>
          {[-0.16, -0.05, 0.05, 0.16].map((z, k) => (
            <mesh key={`cw-${k}`} position={[0, 0, z]}>
              <boxGeometry args={[0.095, 0.04, 0.022]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
            </mesh>
          ))}
        </group>
      </CadPart>

      {/* Camshaft & Valvetrain */}
      <CadPart canonicalId="ice.engine.valvetrain" layer="powerplant" explodeVec={[0, 0.68, 0]} highlightState={highlightState}>
        <mesh ref={camRef} position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.46, 12]} />
          <meshStandardMaterial
            color="#38BDF8"
            metalness={0.8}
            roughness={0.25}
            emissive={valveHi.color}
            emissiveIntensity={valveHi.intensity}
          />
        </mesh>
      </CadPart>

      {/* Intake Manifold */}
      <CadPart canonicalId="ice.intake.manifold" layer="powerplant" explodeVec={[0.35, 0.35, 0]} highlightState={highlightState}>
        <mesh position={[0.19, 0.19, 0]}>
          <boxGeometry args={[0.12, 0.1, 0.42]} />
          <meshStandardMaterial
            color="#334155"
            metalness={0.4}
            roughness={0.55}
            emissive={intakeHi.color}
            emissiveIntensity={intakeHi.intensity}
          />
        </mesh>
      </CadPart>

      {/* Exhaust Header */}
      <CadPart canonicalId="ice.exhaust.manifold-system" layer="powerplant" explodeVec={[-0.35, 0.2, 0]} highlightState={highlightState}>
        <mesh position={[-0.18, 0.14, 0]}>
          <boxGeometry args={[0.1, 0.08, 0.42]} />
          <meshStandardMaterial
            color="#B45309"
            metalness={0.75}
            roughness={0.35}
            emissive={exhaustHi.color}
            emissiveIntensity={exhaustHi.intensity}
          />
        </mesh>
      </CadPart>

      {/* Radiator */}
      <CadPart canonicalId="ice.cooling.radiator-loop" layer="powerplant" explodeVec={[0, 0.15, 0.45]} highlightState={highlightState}>
        <mesh position={[0, 0.02, 0.38]}>
          <boxGeometry args={[0.58, 0.34, 0.045]} />
          <meshStandardMaterial
            color="#475569"
            metalness={0.7}
            roughness={0.4}
            emissive={coolHi.color}
            emissiveIntensity={coolHi.intensity}
          />
        </mesh>
      </CadPart>
    </group>
  );
}

export function VehicleAssembly({
  config,
  journeyHighlightIds,
  regenMode = false,
}: {
  config: VehicleConfiguration;
  journeyHighlightIds?: Set<string>;
  regenMode?: boolean;
}) {
  const selectedId = useKineraStore((s) => s.selectedComponentId);
  const hoveredId = useKineraStore((s) => s.hoveredComponentId);
  const isolatedId = useKineraStore((s) => s.isolatedComponentId);
  const soloIsolation = useKineraStore((s) => s.soloIsolation);
  const showRelationships = useKineraStore((s) => s.showRelationships);
  const showPowerFlow = useKineraStore((s) => s.showPowerFlow);
  const shellTransparency = useKineraStore((s) => s.shellTransparency);
  const sectionCutEnabled = useKineraStore((s) => s.sectionCutEnabled);
  const sectionCutAxis = useKineraStore((s) => s.sectionCutAxis);
  const sectionCutOffset = useKineraStore((s) => s.sectionCutOffset);
  const fourWdMode = useKineraStore((s) => s.fourWdMode);

  const wheelRefs = useRef<(THREE.Group | null)[]>([null, null, null, null]);
  const mainShaftRef = useRef<THREE.Mesh>(null);

  const isIce = config.powertrainType === 'ice';
  const is4wd = config.id === 'vehicle.config.ice-4wd';
  const isFwdIce = config.id === 'vehicle.config.ice-fwd';
  const isAwdIce = config.id === 'vehicle.config.ice-awd';
  const isEvDual = config.id === 'vehicle.config.ev-dual-awd';
  const isEvFront = config.id === 'vehicle.config.ev-fwd' || isEvDual;
  const isEvRear = config.id === 'vehicle.config.ev-rwd' || isEvDual;

  const halfL = config.specification.wheelbaseM * 0.5;
  const halfT = config.specification.trackWidthM * 0.5;
  const rEff = config.specification.tireEffectiveRadiusM;

  const highlightState = useMemo<HighlightState>(() => {
    const upstreamIds = new Set<string>();
    const downstreamIds = new Set<string>();
    if (showRelationships && selectedId) {
      const comp = COMPONENT_BY_ID[selectedId];
      if (comp) {
        comp.relationships.forEach((r) => {
          if (!r.vehicleConfigurations.includes(config.id)) return;
          if (r.targetId === selectedId) upstreamIds.add(r.sourceId);
          if (r.sourceId === selectedId) downstreamIds.add(r.targetId);
        });
      }
    }
    return {
      selectedId,
      hoveredId,
      upstreamIds,
      downstreamIds,
      isolatedId,
      soloIsolation,
      activeJourneyIds: journeyHighlightIds ?? new Set<string>(),
    };
  }, [selectedId, hoveredId, isolatedId, soloIsolation, showRelationships, config.id, journeyHighlightIds]);

  const clipPlanes = useMemo(() => {
    if (!sectionCutEnabled) return [];
    const normal =
      sectionCutAxis === 'x'
        ? new THREE.Vector3(-1, 0, 0)
        : sectionCutAxis === 'y'
          ? new THREE.Vector3(0, -1, 0)
          : new THREE.Vector3(0, 0, -1);
    return [new THREE.Plane(normal, sectionCutOffset)];
  }, [sectionCutEnabled, sectionCutAxis, sectionCutOffset]);

  const bodyShellGeo = useMemo(
    () => createBodyShellGeometry(is4wd, config.specification.wheelbaseM),
    [is4wd, config.specification.wheelbaseM],
  );
  const springGeo = useMemo(() => createHelixCoilGeometry(0.05, 0.26, 6, 0.009), []);

  useFrame((_, delta) => {
    const wheelSpeed = 2.6;
    wheelRefs.current.forEach((wg) => {
      if (wg) wg.rotation.x += wheelSpeed * delta;
    });
    if (mainShaftRef.current) {
      mainShaftRef.current.rotation.y += wheelSpeed * 3.9 * delta;
    }
  });

  const shellOpacity = Math.max(0.06, 1 - shellTransparency);
  const structureId = is4wd ? 'vehicle.structure.ladder-frame' : 'vehicle.structure.unibody';
  const structureHi = getHighlightEmissive(structureId, highlightState);
  const fSubHi = getHighlightEmissive('vehicle.structure.front-subframe', highlightState);
  const rSubHi = getHighlightEmissive('vehicle.structure.rear-subframe', highlightState);
  const steerHi = getHighlightEmissive('vehicle.steering.rack-pinion', highlightState);
  const wheelHi = getHighlightEmissive('vehicle.wheel.tire', highlightState);
  const rimHi = getHighlightEmissive('vehicle.wheel.rim', highlightState);
  const rotorHi = getHighlightEmissive('vehicle.braking.disc-rotor', highlightState);
  const calHi = getHighlightEmissive('vehicle.braking.caliper', highlightState);
  const suspHi = getHighlightEmissive('vehicle.suspension.front-control-arm', highlightState);
  const coilHi = getHighlightEmissive('vehicle.suspension.coil-spring', highlightState);

  const corners: { key: string; x: number; z: number; isFront: boolean; isLeft: boolean }[] = [
    { key: 'FL', x: halfT, z: halfL, isFront: true, isLeft: true },
    { key: 'FR', x: -halfT, z: halfL, isFront: true, isLeft: false },
    { key: 'RL', x: halfT, z: -halfL, isFront: false, isLeft: true },
    { key: 'RR', x: -halfT, z: -halfL, isFront: false, isLeft: false },
  ];

  const isDrivenWheel = (isFront: boolean) => {
    if (is4wd && fourWdMode === '2H') return !isFront;
    return isFront
      ? config.topology.drivenAxles.includes('front')
      : config.topology.drivenAxles.includes('rear');
  };

  return (
    <group name="VehicleAssemblyRoot">
      {/* Exterior Cutaway Body Shell */}
      <CadPart
        canonicalId={structureId}
        layer="exterior"
        explodeVec={[0, 0.95, 0]}
        highlightState={highlightState}
      >
        <mesh geometry={bodyShellGeo} castShadow={false}>
          <meshPhysicalMaterial
            color={is4wd ? '#263449' : '#1E293B'}
            metalness={0.55}
            roughness={0.28}
            transparent
            opacity={shellOpacity * structureHi.opacityMul}
            depthWrite={shellOpacity > 0.75}
            side={THREE.DoubleSide}
            clippingPlanes={clipPlanes}
          />
        </mesh>
        {/* Headlight & Taillight LED signatures */}
        <mesh position={[0, is4wd ? 0.85 : 0.66, halfL + 0.74]}>
          <boxGeometry args={[1.38, 0.045, 0.04]} />
          <meshStandardMaterial color="#E0F2FE" emissive="#00E5FF" emissiveIntensity={1.4} />
        </mesh>
        <mesh position={[0, is4wd ? 0.94 : 0.76, -halfL - 0.7]}>
          <boxGeometry args={[1.36, 0.04, 0.04]} />
          <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.2} />
        </mesh>
      </CadPart>

      {/* Chassis Structure (Ladder Frame for 4WD vs Unibody Rails) */}
      <CadPart
        canonicalId={structureId}
        layer="structure"
        explodeVec={[0, 0.35, 0]}
        highlightState={highlightState}
      >
        {is4wd ? (
          <group>
            {[-0.42, 0.42].map((rx) => (
              <mesh key={`rail-${rx}`} position={[rx, 0.38, 0]} castShadow>
                <boxGeometry args={[0.09, 0.12, config.specification.wheelbaseM + 1.1]} />
                <meshStandardMaterial
                  color="#64748B"
                  metalness={0.75}
                  roughness={0.35}
                  emissive={structureHi.color}
                  emissiveIntensity={structureHi.intensity}
                  clippingPlanes={clipPlanes}
                />
              </mesh>
            ))}
            {[-1.3, -0.45, 0.35, 1.25].map((cz) => (
              <mesh key={`cross-${cz}`} position={[0, 0.38, cz]}>
                <boxGeometry args={[0.84, 0.08, 0.08]} />
                <meshStandardMaterial color="#475569" metalness={0.75} roughness={0.35} />
              </mesh>
            ))}
          </group>
        ) : (
          <group>
            {[-0.68, 0.68].map((rx) => (
              <mesh key={`sill-${rx}`} position={[rx, 0.24, 0]}>
                <boxGeometry args={[0.08, 0.08, config.specification.wheelbaseM + 0.5]} />
                <meshStandardMaterial
                  color="#475569"
                  metalness={0.75}
                  roughness={0.35}
                  emissive={structureHi.color}
                  emissiveIntensity={structureHi.intensity}
                  clippingPlanes={clipPlanes}
                />
              </mesh>
            ))}
          </group>
        )}
      </CadPart>

      {/* Front & Rear Subframes */}
      <CadPart
        canonicalId="vehicle.structure.front-subframe"
        layer="structure"
        explodeVec={[0, -0.15, 0.25]}
        position={[0, 0.28, halfL]}
        highlightState={highlightState}
      >
        <mesh>
          <boxGeometry args={[0.92, 0.06, 0.52]} />
          <meshStandardMaterial
            color="#64748B"
            metalness={0.72}
            roughness={0.36}
            emissive={fSubHi.color}
            emissiveIntensity={fSubHi.intensity}
          />
        </mesh>
      </CadPart>

      <CadPart
        canonicalId="vehicle.structure.rear-subframe"
        layer="structure"
        explodeVec={[0, -0.15, -0.25]}
        position={[0, 0.28, -halfL]}
        highlightState={highlightState}
      >
        <mesh>
          <boxGeometry args={[0.92, 0.06, 0.48]} />
          <meshStandardMaterial
            color="#64748B"
            metalness={0.72}
            roughness={0.36}
            emissive={rSubHi.color}
            emissiveIntensity={rSubHi.intensity}
          />
        </mesh>
      </CadPart>

      {/* ICE Powerplant & Drivetrain */}
      {isIce && (
        <group>
          <Inline4CutawayEngine
            transverse={isFwdIce}
            highlightState={highlightState}
            clipPlanes={clipPlanes}
            spinRate={9.5}
            basePos={isFwdIce ? [-0.14, 0.54, halfL + 0.04] : [0, 0.54, halfL - 0.04]}
          />

          {/* Flywheel & Clutch */}
          <CadPart
            canonicalId="ice.clutch.flywheel"
            layer="drivetrain"
            position={isFwdIce ? [0.16, 0.46, halfL + 0.04] : [0, 0.46, halfL - 0.34]}
            rotation={isFwdIce ? [0, Math.PI / 2, 0] : [Math.PI / 2, 0, 0]}
            explodeVec={[0, 0, -0.18]}
            highlightState={highlightState}
          >
            <mesh>
              <cylinderGeometry args={[0.14, 0.14, 0.035, 20]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.25} />
            </mesh>
          </CadPart>

          {isFwdIce ? (
            <group>
              <CadPart
                canonicalId="ice.transmission.transaxle"
                layer="drivetrain"
                position={[0.32, 0.42, halfL]}
                explodeVec={[0.35, 0, 0]}
                highlightState={highlightState}
              >
                <mesh castShadow>
                  <boxGeometry args={[0.28, 0.24, 0.3]} />
                  <meshStandardMaterial
                    color="#475569"
                    metalness={0.75}
                    roughness={0.32}
                    clippingPlanes={clipPlanes}
                    emissive={getHighlightEmissive('ice.transmission.transaxle', highlightState).color}
                    emissiveIntensity={getHighlightEmissive('ice.transmission.transaxle', highlightState).intensity}
                  />
                </mesh>
              </CadPart>
              <CadPart
                canonicalId="drivetrain.fwd.front-differential"
                layer="drivetrain"
                position={[0, rEff, halfL]}
                explodeVec={[0, -0.2, 0.15]}
                highlightState={highlightState}
              >
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.11, 0.11, 0.2, 16]} />
                  <meshStandardMaterial
                    color="#0284C7"
                    metalness={0.75}
                    roughness={0.3}
                    emissive={getHighlightEmissive('drivetrain.fwd.front-differential', highlightState).color}
                    emissiveIntensity={getHighlightEmissive('drivetrain.fwd.front-differential', highlightState).intensity}
                  />
                </mesh>
              </CadPart>
            </group>
          ) : (
            <group>
              {/* Longitudinal 6-speed Manual Gearbox */}
              <CadPart
                canonicalId="ice.transmission.manual.gear-set"
                layer="drivetrain"
                position={[0, 0.44, halfL - 0.58]}
                explodeVec={[0, -0.18, 0]}
                highlightState={highlightState}
              >
                <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[0.12, 0.15, 0.46, 16]} />
                  <meshStandardMaterial
                    color="#64748B"
                    metalness={0.8}
                    roughness={0.28}
                    clippingPlanes={clipPlanes}
                    emissive={getHighlightEmissive('ice.transmission.manual.gear-set', highlightState).color}
                    emissiveIntensity={getHighlightEmissive('ice.transmission.manual.gear-set', highlightState).intensity}
                  />
                </mesh>
              </CadPart>

              {/* Center Differential (AWD) or Transfer Case (4WD) */}
              {isAwdIce && (
                <CadPart
                  canonicalId="drivetrain.awd.center-differential"
                  layer="drivetrain"
                  position={[0, 0.39, 0.18]}
                  explodeVec={[0, -0.22, 0]}
                  highlightState={highlightState}
                >
                  <mesh>
                    <boxGeometry args={[0.24, 0.2, 0.24]} />
                    <meshStandardMaterial
                      color="#0284C7"
                      metalness={0.78}
                      roughness={0.28}
                      emissive={getHighlightEmissive('drivetrain.awd.center-differential', highlightState).color}
                      emissiveIntensity={getHighlightEmissive('drivetrain.awd.center-differential', highlightState).intensity}
                    />
                  </mesh>
                </CadPart>
              )}

              {is4wd && (
                <CadPart
                  canonicalId="drivetrain.4wd.transfer-case"
                  layer="drivetrain"
                  position={[0.06, 0.39, 0.18]}
                  explodeVec={[0, -0.25, 0]}
                  highlightState={highlightState}
                >
                  <mesh>
                    <boxGeometry args={[0.32, 0.24, 0.28]} />
                    <meshStandardMaterial
                      color="#D97706"
                      metalness={0.78}
                      roughness={0.28}
                      emissive={getHighlightEmissive('drivetrain.4wd.transfer-case', highlightState).color}
                      emissiveIntensity={getHighlightEmissive('drivetrain.4wd.transfer-case', highlightState).intensity}
                    />
                  </mesh>
                </CadPart>
              )}

              {/* Rear Driveshaft */}
              <CadPart
                canonicalId={
                  config.id === 'vehicle.config.ice-rwd'
                    ? 'drivetrain.common.driveshaft-main'
                    : 'drivetrain.common.driveshaft-rear'
                }
                layer="drivetrain"
                position={[0, 0.35, -halfL * 0.45]}
                explodeVec={[0, -0.24, 0]}
                highlightState={highlightState}
              >
                <mesh ref={mainShaftRef} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.036, 0.036, halfL * 1.15, 14]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.88} roughness={0.2} />
                </mesh>
              </CadPart>

              {/* Front Propeller Shaft for AWD / 4WD */}
              {(isAwdIce || is4wd) && (
                <CadPart
                  canonicalId="drivetrain.common.driveshaft-front"
                  layer="drivetrain"
                  position={[0.11, 0.33, halfL * 0.55]}
                  explodeVec={[0.15, -0.22, 0]}
                  highlightState={highlightState}
                >
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.028, 0.028, halfL * 0.72, 12]} />
                    <meshStandardMaterial
                      color={is4wd && fourWdMode === '2H' ? '#475569' : '#E2E8F0'}
                      metalness={0.85}
                      roughness={0.25}
                    />
                  </mesh>
                </CadPart>
              )}

              {/* Rear Differential */}
              <CadPart
                canonicalId={
                  is4wd
                    ? 'drivetrain.4wd.rear-differential'
                    : isAwdIce
                      ? 'drivetrain.awd.rear-differential'
                      : 'drivetrain.rwd.rear-differential'
                }
                layer="drivetrain"
                position={[0, rEff, -halfL]}
                explodeVec={[0, -0.22, -0.18]}
                highlightState={highlightState}
              >
                <mesh>
                  <sphereGeometry args={[0.13, 16, 16]} />
                  <meshStandardMaterial color="#0284C7" metalness={0.78} roughness={0.28} />
                </mesh>
              </CadPart>

              {/* Front Differential for AWD / 4WD */}
              {(isAwdIce || is4wd) && (
                <CadPart
                  canonicalId={is4wd ? 'drivetrain.4wd.front-differential' : 'drivetrain.awd.front-differential'}
                  layer="drivetrain"
                  position={[0, rEff, halfL]}
                  explodeVec={[0, -0.22, 0.18]}
                  highlightState={highlightState}
                >
                  <mesh>
                    <sphereGeometry args={[0.115, 16, 16]} />
                    <meshStandardMaterial
                      color={is4wd && fourWdMode === '2H' ? '#475569' : '#0284C7'}
                      metalness={0.78}
                      roughness={0.28}
                    />
                  </mesh>
                </CadPart>
              )}
            </group>
          )}
        </group>
      )}

      {/* EV Powerplant & E-Axles */}
      {!isIce && (
        <group>
          {/* Underfloor Battery Enclosure + Cell Modules */}
          <CadPart
            canonicalId="ev.battery.enclosure"
            layer="structure"
            position={[0, 0.21, 0]}
            explodeVec={[0, -0.35, 0]}
            highlightState={highlightState}
          >
            <mesh>
              <boxGeometry args={[1.26, 0.12, 1.75]} />
              <meshStandardMaterial
                color="#1E293B"
                metalness={0.7}
                roughness={0.35}
                transparent
                opacity={0.75}
                clippingPlanes={clipPlanes}
              />
            </mesh>
          </CadPart>
          <CadPart
            canonicalId="ev.battery.pack"
            layer="powerplant"
            position={[0, 0.22, 0]}
            explodeVec={[0, -0.22, 0]}
            highlightState={highlightState}
          >
            <group>
              {[-0.6, -0.3, 0, 0.3, 0.6].map((mz, idx) => (
                <mesh key={`mod-${idx}`} position={[0, 0, mz]}>
                  <boxGeometry args={[1.14, 0.085, 0.24]} />
                  <meshStandardMaterial
                    color="#0EA5E9"
                    metalness={0.45}
                    roughness={0.35}
                    emissive={getHighlightEmissive('ev.battery.pack', highlightState).color || '#0284C7'}
                    emissiveIntensity={getHighlightEmissive('ev.battery.pack', highlightState).intensity || 0.25}
                  />
                </mesh>
              ))}
            </group>
          </CadPart>

          {/* BMS Controller */}
          <CadPart
            canonicalId="ev.bms.controller"
            layer="powerplant"
            position={[0, 0.31, 0.72]}
            explodeVec={[0, 0.15, 0.15]}
            highlightState={highlightState}
          >
            <mesh>
              <boxGeometry args={[0.32, 0.06, 0.22]} />
              <meshStandardMaterial color="#00E5FF" metalness={0.6} roughness={0.3} />
            </mesh>
          </CadPart>

          {/* HV Orange PDU & Cabling */}
          <CadPart
            canonicalId="ev.hv.pdu-cabling"
            layer="powerplant"
            position={[0, 0.29, 0]}
            explodeVec={[0, 0.12, 0]}
            highlightState={highlightState}
          >
            <group>
              {isEvFront && (
                <mesh position={[0.18, 0.05, halfL * 0.55]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.018, 0.018, halfL * 0.75, 10]} />
                  <meshStandardMaterial color="#F97316" metalness={0.3} roughness={0.45} />
                </mesh>
              )}
              {isEvRear && (
                <mesh position={[-0.18, 0.05, -halfL * 0.55]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.018, 0.018, halfL * 0.75, 10]} />
                  <meshStandardMaterial color="#F97316" metalness={0.3} roughness={0.45} />
                </mesh>
              )}
            </group>
          </CadPart>

          {/* Front E-Axle */}
          {isEvFront && (
            <group>
              <CadPart
                canonicalId="ev.inverter.front"
                layer="powerplant"
                position={[0, 0.52, halfL]}
                explodeVec={[0, 0.35, 0.15]}
                highlightState={highlightState}
              >
                <mesh>
                  <boxGeometry args={[0.38, 0.1, 0.28]} />
                  <meshStandardMaterial color="#94A3B8" metalness={0.82} roughness={0.25} />
                </mesh>
              </CadPart>
              <CadPart
                canonicalId="ev.motor.front"
                layer="powerplant"
                position={[-0.12, rEff, halfL]}
                explodeVec={[-0.25, 0, 0.1]}
                highlightState={highlightState}
              >
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.145, 0.145, 0.28, 20]} />
                  <meshStandardMaterial
                    color="#0EA5E9"
                    metalness={0.75}
                    roughness={0.28}
                    clippingPlanes={clipPlanes}
                  />
                </mesh>
              </CadPart>
              <CadPart
                canonicalId="ev.transmission.reduction-gearbox-front"
                layer="drivetrain"
                position={[0.14, rEff, halfL]}
                explodeVec={[0.25, 0, 0.1]}
                highlightState={highlightState}
              >
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.12, 0.12, 0.18, 16]} />
                  <meshStandardMaterial color="#64748B" metalness={0.82} roughness={0.25} />
                </mesh>
              </CadPart>
              <CadPart
                canonicalId="drivetrain.ev.front-differential"
                layer="drivetrain"
                position={[0, rEff, halfL]}
                explodeVec={[0, -0.2, 0.15]}
                highlightState={highlightState}
              >
                <mesh>
                  <sphereGeometry args={[0.095, 14, 14]} />
                  <meshStandardMaterial color="#00E5FF" metalness={0.75} roughness={0.25} />
                </mesh>
              </CadPart>
            </group>
          )}

          {/* Rear E-Axle */}
          {isEvRear && (
            <group>
              <CadPart
                canonicalId="ev.inverter.rear"
                layer="powerplant"
                position={[0, 0.52, -halfL]}
                explodeVec={[0, 0.35, -0.15]}
                highlightState={highlightState}
              >
                <mesh>
                  <boxGeometry args={[0.38, 0.1, 0.28]} />
                  <meshStandardMaterial color="#94A3B8" metalness={0.82} roughness={0.25} />
                </mesh>
              </CadPart>
              <CadPart
                canonicalId="ev.motor.rear"
                layer="powerplant"
                position={[-0.12, rEff, -halfL]}
                explodeVec={[-0.25, 0, -0.1]}
                highlightState={highlightState}
              >
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.155, 0.155, 0.3, 20]} />
                  <meshStandardMaterial
                    color="#0EA5E9"
                    metalness={0.75}
                    roughness={0.28}
                    clippingPlanes={clipPlanes}
                  />
                </mesh>
              </CadPart>
              <CadPart
                canonicalId="ev.transmission.reduction-gearbox-rear"
                layer="drivetrain"
                position={[0.14, rEff, -halfL]}
                explodeVec={[0.25, 0, -0.1]}
                highlightState={highlightState}
              >
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.125, 0.125, 0.18, 16]} />
                  <meshStandardMaterial color="#64748B" metalness={0.82} roughness={0.25} />
                </mesh>
              </CadPart>
              <CadPart
                canonicalId="drivetrain.ev.rear-differential"
                layer="drivetrain"
                position={[0, rEff, -halfL]}
                explodeVec={[0, -0.2, -0.15]}
                highlightState={highlightState}
              >
                <mesh>
                  <sphereGeometry args={[0.1, 14, 14]} />
                  <meshStandardMaterial color="#00E5FF" metalness={0.75} roughness={0.25} />
                </mesh>
              </CadPart>
            </group>
          )}
        </group>
      )}

      {/* Steering System */}
      <CadPart
        canonicalId="vehicle.steering.rack-pinion"
        layer="suspension"
        position={[0, rEff + 0.04, halfL - 0.18]}
        explodeVec={[0, 0.15, 0.2]}
        highlightState={highlightState}
      >
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, halfT * 1.4, 12]} />
          <meshStandardMaterial
            color="#94A3B8"
            metalness={0.82}
            roughness={0.26}
            emissive={steerHi.color}
            emissiveIntensity={steerHi.intensity}
          />
        </mesh>
      </CadPart>

      <CadPart
        canonicalId="vehicle.steering.column-wheel"
        layer="suspension"
        position={[0.34, 0.85, 0.42]}
        rotation={[0.48, 0, 0]}
        explodeVec={[0, 0.35, 0]}
        highlightState={highlightState}
      >
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.72, 10]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, -0.36]}>
            <torusGeometry args={[0.16, 0.018, 10, 24]} />
            <meshStandardMaterial color="#1E293B" roughness={0.6} />
          </mesh>
        </group>
      </CadPart>

      {/* Braking Hydraulic Unit */}
      <CadPart
        canonicalId="vehicle.braking.abs-modulator"
        layer="braking"
        position={[-0.36, 0.62, halfL - 0.38]}
        explodeVec={[-0.25, 0.25, 0]}
        highlightState={highlightState}
      >
        <mesh>
          <boxGeometry args={[0.14, 0.12, 0.14]} />
          <meshStandardMaterial color="#EF4444" metalness={0.6} roughness={0.35} />
        </mesh>
      </CadPart>

      {/* 4 Corners: Driven Half-Shafts, Suspension, Brakes, Wheels & Tires */}
      {corners.map((c, idx) => {
        const signX = c.isLeft ? 1 : -1;
        const driven = isDrivenWheel(c.isFront);
        const axleId = c.isFront
          ? c.isLeft
            ? 'drivetrain.common.axle-shaft-front-left'
            : 'drivetrain.common.axle-shaft-front-right'
          : c.isLeft
            ? 'drivetrain.common.axle-shaft-rear-left'
            : 'drivetrain.common.axle-shaft-rear-right';

        return (
          <group key={c.key}>
            {driven && (
              <CadPart
                canonicalId={axleId}
                layer="drivetrain"
                position={[signX * halfT * 0.48, rEff, c.z]}
                explodeVec={[signX * 0.28, -0.1, 0]}
                highlightState={highlightState}
              >
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.022, 0.022, halfT * 0.85, 10]} />
                  <meshStandardMaterial color="#E2E8F0" metalness={0.88} roughness={0.22} />
                </mesh>
              </CadPart>
            )}

            {/* Control Arm */}
            <CadPart
              canonicalId={
                c.isFront
                  ? 'vehicle.suspension.front-control-arm'
                  : 'vehicle.suspension.rear-control-arm'
              }
              layer="suspension"
              position={[signX * (halfT * 0.55), rEff - 0.05, c.z]}
              explodeVec={[signX * 0.25, -0.1, 0]}
              highlightState={highlightState}
            >
              <mesh>
                <boxGeometry args={[halfT * 0.52, 0.032, 0.12]} />
                <meshStandardMaterial
                  color="#64748B"
                  metalness={0.75}
                  roughness={0.3}
                  emissive={suspHi.color}
                  emissiveIntensity={suspHi.intensity}
                />
              </mesh>
            </CadPart>

            {/* Coil Spring + Damper */}
            <CadPart
              canonicalId="vehicle.suspension.coil-spring"
              layer="suspension"
              position={[signX * (halfT - 0.18), rEff + 0.22, c.z]}
              explodeVec={[signX * 0.22, 0.2, 0]}
              highlightState={highlightState}
            >
              <mesh geometry={springGeo}>
                <meshStandardMaterial
                  color="#00E5FF"
                  metalness={0.6}
                  roughness={0.3}
                  emissive={coilHi.color}
                  emissiveIntensity={coilHi.intensity}
                />
              </mesh>
              <mesh>
                <cylinderGeometry args={[0.022, 0.022, 0.3, 10]} />
                <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.25} />
              </mesh>
            </CadPart>

            {/* Brake Rotor & Caliper */}
            <CadPart
              canonicalId="vehicle.braking.disc-rotor"
              layer="braking"
              position={[signX * (halfT - 0.08), rEff, c.z]}
              explodeVec={[signX * 0.42, 0, 0]}
              highlightState={highlightState}
            >
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.165, 0.165, 0.028, 22]} />
                <meshStandardMaterial
                  color="#94A3B8"
                  metalness={0.88}
                  roughness={0.22}
                  emissive={rotorHi.color}
                  emissiveIntensity={rotorHi.intensity}
                />
              </mesh>
            </CadPart>

            <CadPart
              canonicalId="vehicle.braking.caliper"
              layer="braking"
              position={[signX * (halfT - 0.08), rEff + 0.08, c.z + 0.1]}
              explodeVec={[signX * 0.46, 0.08, 0]}
              highlightState={highlightState}
            >
              <mesh>
                <boxGeometry args={[0.065, 0.12, 0.09]} />
                <meshStandardMaterial
                  color="#EF4444"
                  metalness={0.5}
                  roughness={0.35}
                  emissive={calHi.color}
                  emissiveIntensity={calHi.intensity}
                />
              </mesh>
            </CadPart>

            {/* Wheel Rim + Radial Tire */}
            <CadPart
              canonicalId="vehicle.wheel.tire"
              layer="wheels"
              position={[c.x, rEff, c.z]}
              explodeVec={[signX * 0.65, 0, 0]}
              highlightState={highlightState}
            >
              <group
                ref={(el) => {
                  wheelRefs.current[idx] = el;
                }}
              >
                {/* Tire Tread Ring */}
                <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
                  <torusGeometry args={[rEff - 0.075, 0.078, 14, 28]} />
                  <meshStandardMaterial
                    color="#181C22"
                    roughness={0.85}
                    metalness={0.1}
                    emissive={wheelHi.color}
                    emissiveIntensity={wheelHi.intensity}
                  />
                </mesh>
                {/* Tire Sidewall Cylinder */}
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[rEff - 0.015, rEff - 0.015, 0.215, 24, 1, true]} />
                  <meshStandardMaterial color="#181C22" roughness={0.88} side={THREE.DoubleSide} />
                </mesh>
                {/* Alloy Rim Barrel & 5 Spokes */}
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[rEff - 0.11, rEff - 0.11, 0.16, 20]} />
                  <meshStandardMaterial
                    color="#94A3B8"
                    metalness={0.88}
                    roughness={0.22}
                    emissive={rimHi.color}
                    emissiveIntensity={rimHi.intensity}
                  />
                </mesh>
                {[0, 1, 2, 3, 4].map((spoke) => (
                  <mesh
                    key={`sp-${spoke}`}
                    position={[signX * 0.06, 0, 0]}
                    rotation={[(spoke * Math.PI * 2) / 5, 0, 0]}
                  >
                    <boxGeometry args={[0.025, (rEff - 0.11) * 1.9, 0.032]} />
                    <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
                  </mesh>
                ))}
              </group>
            </CadPart>

            {/* Contact Patch Indicator */}
            <CadPart
              canonicalId="vehicle.wheel.contact-patch"
              layer="wheels"
              position={[c.x, 0.005, c.z]}
              highlightState={highlightState}
            >
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.24, 0.3]} />
                <meshStandardMaterial
                  color={driven ? '#00E5FF' : '#475569'}
                  emissive={driven ? '#00E5FF' : '#000000'}
                  emissiveIntensity={driven ? 0.55 : 0}
                  transparent
                  opacity={0.45}
                />
              </mesh>
            </CadPart>
          </group>
        );
      })}

      {/* Dynamic Power Flow Splines */}
      <PowerFlowOverlay
        config={config}
        visible={showPowerFlow}
        regenMode={regenMode}
        fourWdMode={fourWdMode}
      />
    </group>
  );
}
