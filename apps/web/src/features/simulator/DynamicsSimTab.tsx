import { AlertCircle, BookOpen, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CONFIG_BY_ID } from '../../data/configs';
import { simulationClient } from '../../simulation/SimulationClient';
import { formatAngle, formatSpeed, radToDeg } from '../../simulation/units';
import { EngineeringChart } from '../../shared/EngineeringChart';
import { EquationDrawer } from '../../shared/EquationDrawer';
import { useKineraStore } from '../../store/useKineraStore';
import type { ErrorEnvelope, SimulationInput } from '../../types/kinera';

type DynamicsSubTab = 'longitudinal' | 'lateral' | 'braking' | 'traction';

export function DynamicsSimTab() {
  const [subTab, setSubTab] = useState<DynamicsSubTab>('longitudinal');
  const [showEq, setShowEq] = useState(false);

  const activeConfigId = useKineraStore((s) => s.activeConfigId);
  const unitMode = useKineraStore((s) => s.unitMode);
  const simThrottle = useKineraStore((s) => s.simThrottle);
  const simBrakeDemand = useKineraStore((s) => s.simBrakeDemand);
  const simSteeringAngleRad = useKineraStore((s) => s.simSteeringAngleRad);
  const simInitialSpeedMps = useKineraStore((s) => s.simInitialSpeedMps);
  const simRoadGradeRad = useKineraStore((s) => s.simRoadGradeRad);
  const simWheelMu = useKineraStore((s) => s.simWheelMu);
  const simMassOverrideKg = useKineraStore((s) => s.simMassOverrideKg);
  const simCdOverride = useKineraStore((s) => s.simCdOverride);
  const simCrrOverride = useKineraStore((s) => s.simCrrOverride);
  const simCgFrontOverrideM = useKineraStore((s) => s.simCgFrontOverrideM);
  const simFrontBrakeBias = useKineraStore((s) => s.simFrontBrakeBias);
  const simAbsEnabled = useKineraStore((s) => s.simAbsEnabled);
  const simDurationSec = useKineraStore((s) => s.simDurationSec);
  const simDiffMode = useKineraStore((s) => s.simDiffMode);
  const fourWdMode = useKineraStore((s) => s.fourWdMode);

  const dynamicsOutput = useKineraStore((s) => s.dynamicsOutput);
  const benchmarkOutput = useKineraStore((s) => s.benchmarkOutput);
  const simError = useKineraStore((s) => s.simError);
  const lastComputeMs = useKineraStore((s) => s.lastComputeMs);
  const updateSimParams = useKineraStore((s) => s.updateSimParams);
  const setSimResults = useKineraStore((s) => s.setSimResults);
  const resetSimToConfigDefaults = useKineraStore((s) => s.resetSimToConfigDefaults);

  const config = CONFIG_BY_ID[activeConfigId];
  const spec = config.specification;

  const effectiveMass = simMassOverrideKg ?? spec.massKg;
  const effectiveCd = simCdOverride ?? spec.dragCoefficient;
  const effectiveCrr = simCrrOverride ?? spec.rollingResistanceCoeff;
  const effectiveCgFront = simCgFrontOverrideM ?? spec.cgToFrontAxleM;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const throttleToUse = subTab === 'braking' ? 0.0 : simThrottle;
      const brakeToUse = subTab === 'braking' ? Math.max(0.2, simBrakeDemand || 0.85) : 0.0;
      const steerToUse = subTab === 'lateral' || subTab === 'traction' ? simSteeringAngleRad : 0.0;
      const v0 = subTab === 'braking' ? Math.max(5.0, simInitialSpeedMps) : subTab === 'lateral' ? Math.max(1.0, simInitialSpeedMps) : simInitialSpeedMps;

      const input: SimulationInput = {
        schemaVersion: '1.0.0',
        mode: 'time_series_dynamics',
        configurationIds: [activeConfigId],
        parameterOverrides: {
          massKg: effectiveMass,
          dragCoefficient: effectiveCd,
          rollingResistanceCoeff: effectiveCrr,
          cgToFrontAxleM: effectiveCgFront,
          frontBrakeBias: simFrontBrakeBias,
        },
        driverInputs: {
          throttle: throttleToUse,
          brakeDemand: brakeToUse,
          steeringAngleRad: steerToUse,
          gearIndex: config.powertrainType === 'ev' ? 1 : 2,
          primeMoverRpm: null,
          fourWdMode: config.id === 'vehicle.config.ice-4wd' ? fourWdMode : null,
          diffMode: simDiffMode,
          evFrontSplit: config.id === 'vehicle.config.ev-dual-awd' ? 0.4 : null,
        },
        environment: {
          roadGradeRad: simRoadGradeRad,
          airDensityKgM3: 1.225,
          wheelMu: simWheelMu,
          gravityMps2: 9.80665,
        },
        solverConfig: {
          dtSec: 0.01,
          durationSec: simDurationSec,
          initialSpeedMps: v0,
          initialSoc: 0.85,
          absConceptualEnabled: simAbsEnabled,
          matchedBaselineLock: false,
        },
      };

      setSimResults({ simRunning: true });
      Promise.all([
        simulationClient.runDynamics(input),
        simulationClient.runBenchmark({ ...input, mode: 'performance_benchmark' }),
      ])
        .then(([dynRes, benchRes]) => {
          setSimResults({
            wasmStatus: 'ready',
            simRunning: false,
            lastComputeMs: dynRes.durationMs,
            simError: null,
            dynamicsOutput: dynRes.output,
            benchmarkOutput: benchRes.output,
          });
        })
        .catch((err: ErrorEnvelope) => {
          if (err?.error?.code === 'CANCELLED') return;
          setSimResults({ simRunning: false, simError: err });
        });
    }, 30);
    return () => window.clearTimeout(timer);
  }, [
    subTab,
    activeConfigId,
    config.id,
    config.powertrainType,
    effectiveMass,
    effectiveCd,
    effectiveCrr,
    effectiveCgFront,
    simFrontBrakeBias,
    simThrottle,
    simBrakeDemand,
    simSteeringAngleRad,
    simInitialSpeedMps,
    simRoadGradeRad,
    simWheelMu,
    simAbsEnabled,
    simDurationSec,
    simDiffMode,
    fourWdMode,
    setSimResults,
  ]);

  const frames = useMemo(() => dynamicsOutput?.timeSeries ?? [], [dynamicsOutput]);
  const lastFrame = frames[frames.length - 1];
  const perf = benchmarkOutput?.summaryMetrics;

  const speedMultiplier = unitMode === 'si' ? 1 : 3.6;
  const speedUnit = unitMode === 'si' ? 'm/s' : 'km/h';

  const longSpeedSeries = useMemo(
    () => [
      {
        id: 'speed',
        label: `Speed (${speedUnit})`,
        color: '#00E5FF',
        points: frames.map((f) => ({ x: f.timeSec, y: f.speedMps * speedMultiplier })),
      },
    ],
    [frames, speedMultiplier, speedUnit],
  );

  const forceSeries = useMemo(
    () => [
      {
        id: 'f-trac',
        label: 'Tractive (N)',
        color: '#10B981',
        points: frames.map((f) => ({ x: f.timeSec, y: f.tractiveForceN })),
      },
      {
        id: 'f-drag',
        label: 'Aero Drag (N)',
        color: '#F59E0B',
        points: frames.map((f) => ({ x: f.timeSec, y: f.dragForceN })),
      },
      {
        id: 'f-roll',
        label: 'Rolling + Grade (N)',
        color: '#3B82F6',
        dashed: '4 3',
        points: frames.map((f) => ({ x: f.timeSec, y: f.rollingForceN + f.gradeForceN })),
      },
    ],
    [frames],
  );

  const latYawSeries = useMemo(
    () => [
      {
        id: 'yaw-rate',
        label: 'Yaw Rate (deg/s)',
        color: '#00E5FF',
        points: frames.map((f) => ({ x: f.timeSec, y: radToDeg(f.yawRateRadS) })),
      },
      {
        id: 'ay',
        label: 'Lateral Accel (m/s²)',
        color: '#F59E0B',
        dashed: '5 3',
        points: frames.map((f) => ({ x: f.timeSec, y: f.accelLatMps2 })),
      },
    ],
    [frames],
  );

  const xyPathSeries = useMemo(
    () => [
      {
        id: 'xy-path',
        label: 'Vehicle CG Trajectory (X, Y m)',
        color: '#10B981',
        points: frames.map((f) => ({ x: f.worldXM, y: f.worldYM })),
      },
    ],
    [frames],
  );

  const kusVal = dynamicsOutput?.summaryMetrics?.understeerGradientRadPerMps2?.value ?? 0;
  const handlingLabel =
    Math.abs(kusVal) < 1e-5 ? 'Neutral Steer' : kusVal > 0 ? 'Understeer (K_us > 0)' : 'Oversteer (K_us < 0)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Sub-navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(
            [
              { id: 'longitudinal', label: '1. Longitudinal & Grade' },
              { id: 'lateral', label: '2. Lateral Bicycle Model' },
              { id: 'braking', label: '3. Braking & Weight Transfer' },
              { id: 'traction', label: '4. Friction Circle & Performance' },
            ] as { id: DynamicsSubTab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              className={`kin-btn kin-btn-sm ${subTab === t.id ? 'kin-btn-primary' : ''}`}
              onClick={() => setSubTab(t.id)}
              data-testid={`dynamics-subtab-${t.id}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {lastComputeMs !== null && (
            <span className="kin-badge kin-badge-emerald mono">RK4 WASM {lastComputeMs.toFixed(2)} ms</span>
          )}
          <button type="button" className="kin-btn kin-btn-sm" onClick={() => setShowEq(true)}>
            <BookOpen size={13} />
            Equations
          </button>
          <button type="button" className="kin-btn kin-btn-sm" onClick={resetSimToConfigDefaults}>
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </div>

      {simError && (
        <div className="kin-panel" style={{ borderColor: 'var(--accent-red)', padding: '0.75rem' }} role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#fca5a5', fontWeight: 600 }}>
            <AlertCircle size={16} />
            <span className="mono">{simError.error.code}</span>
          </div>
          <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>{simError.error.message}</div>
        </div>
      )}

      {dynamicsOutput?.warnings && dynamicsOutput.warnings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {dynamicsOutput.warnings.map((w) => (
            <div key={w.code} className="kin-disclaimer">
              <span className="mono" style={{ fontWeight: 700 }}>{w.code}</span>
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(290px, 340px) minmax(0, 1fr)', gap: '0.9rem' }}>
        {/* Left Parameters */}
        <div className="kin-panel">
          <div className="kin-panel-header">
            <h3 className="kin-panel-title">Model Parameters (SI)</h3>
            <span className="kin-badge mono">{config.code}</span>
          </div>
          <div className="kin-panel-body">
            <div className="kin-slider-row">
              <div className="kin-slider-label">
                <span>Vehicle Mass (m)</span>
                <span className="mono">{effectiveMass} kg</span>
              </div>
              <input
                type="range"
                min={800}
                max={3200}
                step={20}
                value={effectiveMass}
                onChange={(e) => updateSimParams({ simMassOverrideKg: Number(e.target.value) })}
                className="kin-range"
              />
            </div>

            <div className="kin-slider-row">
              <div className="kin-slider-label">
                <span>Initial Speed (v₀)</span>
                <span className="mono">
                  {formatSpeed(simInitialSpeedMps, unitMode).value} {formatSpeed(simInitialSpeedMps, unitMode).unit}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={45}
                step={1}
                value={simInitialSpeedMps}
                onChange={(e) => updateSimParams({ simInitialSpeedMps: Number(e.target.value) })}
                className="kin-range"
              />
            </div>

            <div className="kin-slider-row">
              <div className="kin-slider-label">
                <span>Tire-Road Friction (μ)</span>
                <span className="mono">{simWheelMu[0].toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1.2}
                step={0.05}
                value={simWheelMu[0]}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  updateSimParams({ simWheelMu: [m, m, m, m] });
                }}
                className="kin-range"
              />
            </div>

            {(subTab === 'longitudinal' || subTab === 'braking') && (
              <>
                <div className="kin-slider-row">
                  <div className="kin-slider-label">
                    <span>Road Grade (θ)</span>
                    <span className="mono">{(Math.tan(simRoadGradeRad) * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min={-0.25}
                    max={0.3}
                    step={0.01}
                    value={simRoadGradeRad}
                    onChange={(e) => updateSimParams({ simRoadGradeRad: Number(e.target.value) })}
                    className="kin-range"
                  />
                </div>
                <div className="kin-slider-row">
                  <div className="kin-slider-label">
                    <span>Drag Coefficient (C_d)</span>
                    <span className="mono">{effectiveCd.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.18}
                    max={0.65}
                    step={0.01}
                    value={effectiveCd}
                    onChange={(e) => updateSimParams({ simCdOverride: Number(e.target.value) })}
                    className="kin-range"
                  />
                </div>
              </>
            )}

            {(subTab === 'lateral' || subTab === 'traction') && (
              <>
                <div className="kin-slider-row">
                  <div className="kin-slider-label">
                    <span>Road-Wheel Steer (δ)</span>
                    <span className="mono">
                      {formatAngle(simSteeringAngleRad, unitMode).value} {formatAngle(simSteeringAngleRad, unitMode).unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-0.25}
                    max={0.25}
                    step={0.005}
                    value={simSteeringAngleRad}
                    onChange={(e) => updateSimParams({ simSteeringAngleRad: Number(e.target.value) })}
                    className="kin-range"
                  />
                </div>
                <div className="kin-slider-row">
                  <div className="kin-slider-label">
                    <span>CG Distance to Front Axle (a)</span>
                    <span className="mono">{effectiveCgFront.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min={0.7}
                    max={spec.wheelbaseM - 0.7}
                    step={0.02}
                    value={effectiveCgFront}
                    onChange={(e) => updateSimParams({ simCgFrontOverrideM: Number(e.target.value) })}
                    className="kin-range"
                  />
                </div>
              </>
            )}

            {subTab === 'braking' && (
              <>
                <div className="kin-slider-row">
                  <div className="kin-slider-label">
                    <span>Brake Demand</span>
                    <span className="mono">{Math.round((simBrakeDemand || 0.85) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={simBrakeDemand || 0.85}
                    onChange={(e) => updateSimParams({ simBrakeDemand: Number(e.target.value) })}
                    className="kin-range"
                  />
                </div>
                <div className="kin-slider-row">
                  <div className="kin-slider-label">
                    <span>Front Brake Bias</span>
                    <span className="mono">{Math.round(simFrontBrakeBias * 100)}% F</span>
                  </div>
                  <input
                    type="range"
                    min={0.45}
                    max={0.85}
                    step={0.05}
                    value={simFrontBrakeBias}
                    onChange={(e) => updateSimParams({ simFrontBrakeBias: Number(e.target.value) })}
                    className="kin-range"
                  />
                </div>
                <button
                  type="button"
                  className={`kin-btn kin-btn-sm ${simAbsEnabled ? 'kin-btn-primary' : ''}`}
                  onClick={() => updateSimParams({ simAbsEnabled: !simAbsEnabled })}
                >
                  Conceptual ABS: {simAbsEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </>
            )}

            <div className="kin-slider-row" style={{ marginTop: '0.6rem' }}>
              <div className="kin-slider-label">
                <span>Simulation Duration</span>
                <span className="mono">{simDurationSec.toFixed(1)} s</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                value={simDurationSec}
                onChange={(e) => updateSimParams({ simDurationSec: Number(e.target.value) })}
                className="kin-range"
              />
            </div>
          </div>
        </div>

        {/* Right Visualizations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: 0 }}>
          {subTab === 'longitudinal' && (
            <>
              <div className="kin-metric-grid">
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Final Speed</div>
                  <div className="kin-metric-value">
                    {formatSpeed(lastFrame?.speedMps ?? 0, unitMode).value}
                    <span className="kin-metric-unit">{speedUnit}</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Distance Covered</div>
                  <div className="kin-metric-value">
                    {(lastFrame?.distanceM ?? 0).toFixed(1)}
                    <span className="kin-metric-unit">m</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Peak Acceleration</div>
                  <div className="kin-metric-value">
                    {Math.max(0, ...frames.map((f) => f.accelLongMps2)).toFixed(2)}
                    <span className="kin-metric-unit">m/s²</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Aero Drag @ End</div>
                  <div className="kin-metric-value">
                    {(lastFrame?.dragForceN ?? 0).toFixed(0)}
                    <span className="kin-metric-unit">N</span>
                  </div>
                </div>
              </div>
              <EngineeringChart
                title="Longitudinal Speed vs. Time"
                xLabel="Time (s)"
                yLabel={`Speed (${speedUnit})`}
                series={longSpeedSeries}
                height={215}
              />
              <EngineeringChart
                title="Force Balance Breakdown"
                xLabel="Time (s)"
                yLabel="Force (N)"
                series={forceSeries}
                height={215}
              />
            </>
          )}

          {subTab === 'lateral' && (
            <>
              <div className="kin-metric-grid">
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Handling Regime</div>
                  <div className="kin-metric-value" style={{ fontSize: '0.88rem' }}>{handlingLabel}</div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Understeer Gradient</div>
                  <div className="kin-metric-value">
                    {(kusVal * 1000).toFixed(2)}
                    <span className="kin-metric-unit">mrad/(m/s²)</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Yaw Rate @ End</div>
                  <div className="kin-metric-value">
                    {radToDeg(lastFrame?.yawRateRadS ?? 0).toFixed(1)}
                    <span className="kin-metric-unit">deg/s</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Front / Rear Slip</div>
                  <div className="kin-metric-value" style={{ fontSize: '0.88rem' }}>
                    {radToDeg(lastFrame?.slipAngleFrontRad ?? 0).toFixed(2)}° /{' '}
                    {radToDeg(lastFrame?.slipAngleRearRad ?? 0).toFixed(2)}°
                  </div>
                </div>
              </div>
              <EngineeringChart
                title="2-DOF Bicycle Yaw Rate & Lateral Acceleration"
                xLabel="Time (s)"
                yLabel="deg/s | m/s²"
                series={latYawSeries}
                height={215}
              />
              <EngineeringChart
                title="2D Vehicle World Trajectory (X, Y)"
                xLabel="World X (m)"
                yLabel="World Y (m)"
                series={xyPathSeries}
                height={215}
                equalAspect
              />
            </>
          )}

          {subTab === 'braking' && lastFrame && (
            <>
              <div className="kin-metric-grid">
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Stopping Distance</div>
                  <div className="kin-metric-value">
                    {lastFrame.distanceM.toFixed(2)}
                    <span className="kin-metric-unit">m</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Peak Deceleration</div>
                  <div className="kin-metric-value">
                    {Math.min(0, ...frames.map((f) => f.accelLongMps2)).toFixed(2)}
                    <span className="kin-metric-unit">m/s²</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Total Normal Load Sum</div>
                  <div className="kin-metric-value">
                    {lastFrame.wheelNormalLoadsN.reduce((a, b) => a + b, 0).toFixed(0)}
                    <span className="kin-metric-unit">N</span>
                  </div>
                </div>
              </div>

              {/* 4-Wheel Dynamic Load Bars */}
              <div className="kin-panel" style={{ padding: '0.9rem' }}>
                <h4 className="kin-panel-title" style={{ marginBottom: '0.65rem' }}>
                  4-Wheel Quasi-Static Vertical Normal Loads (F_z)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
                  {(['FL', 'FR', 'RL', 'RR'] as const).map((label, idx) => {
                    const fz = lastFrame.wheelNormalLoadsN[idx];
                    const pct = Math.min(100, (fz / (effectiveMass * 9.81 * 0.5)) * 100);
                    return (
                      <div key={label} style={{ background: '#0e1116', padding: '0.6rem', borderRadius: 6, border: '1px solid var(--border-hairline)' }}>
                        <div className="mono" style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{label}</div>
                        <div className="mono" style={{ fontSize: '1rem', fontWeight: 600, margin: '0.25rem 0' }}>
                          {fz.toFixed(0)} N
                        </div>
                        <div style={{ height: 8, background: '#1c232e', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-cyan)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <EngineeringChart
                title="Braking Deceleration Speed Profile"
                xLabel="Time (s)"
                yLabel={`Speed (${speedUnit})`}
                series={longSpeedSeries}
                height={215}
              />
            </>
          )}

          {subTab === 'traction' && (
            <>
              {lastFrame && (
                <div className="kin-panel" style={{ padding: '0.9rem' }}>
                  <h4 className="kin-panel-title" style={{ marginBottom: '0.65rem' }}>
                    Simplified Tire Friction Circle Utilization
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {(['FL', 'FR', 'RL', 'RR'] as const).map((label, idx) => {
                      const util = lastFrame.frictionUtilization[idx];
                      const fz = lastFrame.wheelNormalLoadsN[idx];
                      const color = util >= 0.99 ? '#EF4444' : util >= 0.85 ? '#F59E0B' : '#00E5FF';
                      return (
                        <div key={label} style={{ textAlign: 'center', background: '#0e1116', padding: '0.65rem', borderRadius: 6, border: '1px solid var(--border-hairline)' }}>
                          <div className="mono" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>{label} · {(util * 100).toFixed(0)}%</div>
                          <svg width="96" height="96" viewBox="-50 -50 100 100">
                            <circle cx="0" cy="0" r="42" fill="none" stroke="#262f3d" strokeWidth="1.5" />
                            <line x1="-42" y1="0" x2="42" y2="0" stroke="#1c232e" />
                            <line x1="0" y1="-42" x2="0" y2="42" stroke="#1c232e" />
                            <circle cx="0" cy="0" r={Math.min(42, util * 42)} fill={color} fillOpacity="0.22" stroke={color} strokeWidth="2" />
                          </svg>
                          <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            F_max = {(simWheelMu[idx] * fz).toFixed(0)} N
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {perf && (
                <div className="kin-panel" style={{ padding: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <h4 className="kin-panel-title" style={{ margin: 0 }}>Vehicle Performance Benchmark</h4>
                    <span className="kin-badge kin-badge-amber">
                      Simulated Model Estimate — Not Production Vehicle Data
                    </span>
                  </div>
                  <div className="kin-metric-grid" data-testid="performance-estimates">
                    <div className="kin-metric-card">
                      <div className="kin-metric-label">0–100 km/h</div>
                      <div className="kin-metric-value">{perf.zeroTo100KmhSec.value.toFixed(2)}<span className="kin-metric-unit">s</span></div>
                    </div>
                    <div className="kin-metric-card">
                      <div className="kin-metric-label">Quarter-Mile (402 m)</div>
                      <div className="kin-metric-value">{perf.quarterMileSec.value.toFixed(2)}<span className="kin-metric-unit">s</span></div>
                    </div>
                    <div className="kin-metric-card">
                      <div className="kin-metric-label">Est. Top Speed</div>
                      <div className="kin-metric-value">
                        {formatSpeed(perf.topSpeedMps.value, unitMode).value}
                        <span className="kin-metric-unit">{speedUnit}</span>
                      </div>
                    </div>
                    <div className="kin-metric-card">
                      <div className="kin-metric-label">100–0 km/h Braking</div>
                      <div className="kin-metric-value">{perf.braking100To0M.value.toFixed(1)}<span className="kin-metric-unit">m</span></div>
                    </div>
                    <div className="kin-metric-card">
                      <div className="kin-metric-label">Max Gradeability</div>
                      <div className="kin-metric-value">{perf.maxGradeabilityPct.value.toFixed(1)}<span className="kin-metric-unit">%</span></div>
                    </div>
                    <div className="kin-metric-card">
                      <div className="kin-metric-label">Cruise Consumption</div>
                      <div className="kin-metric-value">{perf.cruiseEnergyWhPerKm.value.toFixed(0)}<span className="kin-metric-unit">Wh/km</span></div>
                    </div>
                    <div className="kin-metric-card">
                      <div className="kin-metric-label">Power-to-Weight</div>
                      <div className="kin-metric-value">{perf.powerToWeightWPerKg.value.toFixed(1)}<span className="kin-metric-unit">W/kg</span></div>
                    </div>
                    <div className="kin-metric-card">
                      <div className="kin-metric-label">Max Cornering Cap</div>
                      <div className="kin-metric-value">{(perf.maxLateralAccelMps2.value / 9.80665).toFixed(2)}<span className="kin-metric-unit">g</span></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showEq && (
        <EquationDrawer
          equationIds={[
            'eq.dynamics.longitudinal-net-force',
            'eq.dynamics.aero-drag',
            'eq.dynamics.bicycle-lateral',
            'eq.dynamics.bicycle-yaw',
            'eq.dynamics.understeer-gradient',
            'eq.dynamics.braking-force',
            'eq.dynamics.weight-transfer-longitudinal',
            'eq.dynamics.weight-transfer-lateral',
            'eq.dynamics.friction-circle',
          ]}
          onClose={() => setShowEq(false)}
        />
      )}
    </div>
  );
}
