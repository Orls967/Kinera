import { Grid } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CONFIG_BY_ID } from '../data/configs';
import { useKineraStore } from '../store/useKineraStore';
import { CameraRig } from './CameraRig';
import { VehicleAssembly } from './VehicleAssembly';

function RendererTelemetryAndClipping() {
  const { gl } = useThree();
  const setSceneStats = useKineraStore((s) => s.setSceneStats);
  const qualityTier = useKineraStore((s) => s.qualityTier);
  const setQualityTier = useKineraStore((s) => s.setQualityTier);
  const accFrames = useRef(0);
  const accTime = useRef(0);
  const lowFpsStreak = useRef(0);

  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  useFrame((_, delta) => {
    accFrames.current += 1;
    accTime.current += delta;
    if (accTime.current >= 0.75) {
      const fps = Math.round(accFrames.current / accTime.current);
      const info = gl.info.render;
      setSceneStats({
        triangles: info.triangles,
        drawCalls: info.calls,
        fps,
      });
      if (fps < 28) {
        lowFpsStreak.current += 1;
        if (lowFpsStreak.current >= 4 && qualityTier === 'high') {
          setQualityTier('medium');
        } else if (lowFpsStreak.current >= 6 && qualityTier === 'medium') {
          setQualityTier('low');
        }
      } else {
        lowFpsStreak.current = 0;
      }
      accFrames.current = 0;
      accTime.current = 0;
    }
  });

  return null;
}

export function KineraViewport({
  autoRotate = false,
  journeyHighlightIds,
  regenMode = false,
  height = '100%',
}: {
  autoRotate?: boolean;
  journeyHighlightIds?: Set<string>;
  regenMode?: boolean;
  height?: string | number;
}) {
  const activeConfigId = useKineraStore((s) => s.activeConfigId);
  const qualityTier = useKineraStore((s) => s.qualityTier);
  const selectComponent = useKineraStore((s) => s.selectComponent);
  const [webglError, setWebglError] = useState<string | null>(null);
  const config = CONFIG_BY_ID[activeConfigId];

  const dpr: [number, number] =
    qualityTier === 'high' ? [1, 2] : qualityTier === 'medium' ? [1, 1.5] : [1, 1];

  if (webglError) {
    return (
      <div
        className="kin-viewport-stage"
        style={{
          height,
          display: 'grid',
          placeItems: 'center',
          padding: '1.5rem',
          textAlign: 'center',
        }}
      >
        <div>
          <h4 style={{ margin: '0 0 0.5rem', color: 'var(--accent-amber)' }}>
            WebGL 3D Viewport Recovery
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 420 }}>
            {webglError}. Architecture: <strong>{config.code}</strong> ({config.topology.placement}).
          </p>
          <button
            type="button"
            className="kin-btn kin-btn-primary"
            onClick={() => setWebglError(null)}
          >
            Retry WebGL Context
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="kin-viewport-stage"
      style={{ height }}
      data-testid="kinera-3d-viewport"
    >
      <Canvas
        shadows={qualityTier !== 'low'}
        dpr={dpr}
        camera={{ position: [3.4, 1.75, 3.6], fov: 40, near: 0.1, far: 80 }}
        gl={{ antialias: qualityTier !== 'low', powerPreference: 'high-performance' }}
        onPointerMissed={() => selectComponent(null)}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            setWebglError('WebGL rendering context was lost');
          });
        }}
      >
        <color attach="background" args={['#0b0f15']} />
        <fog attach="fog" args={['#0b0f15', 14, 34]} />

        {/* 3-Point Engineering Studio Lighting Rig */}
        <ambientLight intensity={0.65} color="#cbd5e1" />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.55}
          color="#f8fafc"
          castShadow={qualityTier !== 'low'}
          shadow-mapSize-width={qualityTier === 'high' ? 1024 : 512}
          shadow-mapSize-height={qualityTier === 'high' ? 1024 : 512}
        />
        <directionalLight position={[-6, 4, -4]} intensity={0.85} color="#38bdf8" />
        <pointLight position={[0, 1.8, 0]} intensity={0.5} color="#00e5ff" />

        {/* Calibration Metric Grid & Turntable Ring */}
        <Grid
          position={[0, 0, 0]}
          args={[18, 18]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#1e293b"
          sectionSize={1.0}
          sectionThickness={1.1}
          sectionColor="#2b3b52"
          fadeDistance={16}
        />
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.55, 2.6, 64]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.32} />
        </mesh>

        <VehicleAssembly
          config={config}
          journeyHighlightIds={journeyHighlightIds}
          regenMode={regenMode}
        />

        <CameraRig autoRotate={autoRotate} />
        <RendererTelemetryAndClipping />
      </Canvas>
    </div>
  );
}
