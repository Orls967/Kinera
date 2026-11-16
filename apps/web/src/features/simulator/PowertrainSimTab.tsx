import { AlertCircle, BookOpen, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CONFIG_BY_ID } from '../../data/configs';
import { simulationClient } from '../../simulation/SimulationClient';
import { formatAngularSpeed, formatPower, formatTorque } from '../../simulation/units';
import { EngineeringChart } from '../../shared/EngineeringChart';
import { EquationDrawer } from '../../shared/EquationDrawer';
import { useKineraStore } from '../../store/useKineraStore';
import type { DiffMode, ErrorEnvelope, FourWdMode, SimulationInput } from '../../types/kinera';

const SURFACE_PRESETS = [
  { label: 'Dry Asphalt (0.90)', mu: 0.9 },
  { label: 'Wet Asphalt (0.55)', mu: 0.55 },
  { label: 'Gravel (0.45)', mu: 0.45 },
  { label: 'Packed Snow (0.30)', mu: 0.3 },
  { label: 'Ice (0.15)', mu: 0.15 },
];

export function PowertrainSimTab() {
  const activeConfigId = useKineraStore((s) => s.activeConfigId);
  const unitMode = useKineraStore((s) => s.unitMode);
  const simThrottle = useKineraStore((s) => s.simThrottle);
  const simGearIndex = useKineraStore((s) => s.simGearIndex);
  const simPrimeMoverRpm = useKineraStore((s) => s.simPrimeMoverRpm);
  const simDiffMode = useKineraStore((s) => s.simDiffMode);
  const simEvFrontSplit = useKineraStore((s) => s.simEvFrontSplit);
  const simWheelMu = useKineraStore((s) => s.simWheelMu);
  const simInitialSoc = useKineraStore((s) => s.simInitialSoc);
  const simAggregateEffOverride = useKineraStore((s) => s.simAggregateEffOverride);
  const fourWdMode = useKineraStore((s) => s.fourWdMode);
  const setFourWdMode = useKineraStore((s) => s.setFourWdMode);
  const powertrainOutput = useKineraStore((s) => s.powertrainOutput);
  const lastComputeMs = useKineraStore((s) => s.lastComputeMs);
  const simError = useKineraStore((s) => s.simError);
  const updateSimParams = useKineraStore((s) => s.updateSimParams);
  const setSimResults = useKineraStore((s) => s.setSimResults);
  const resetSimToConfigDefaults = useKineraStore((s) => s.resetSimToConfigDefaults);

  const [showEq, setShowEq] = useState(false);
  const [effOverrideText, setEffOverrideText] = useState('');

  const config = CONFIG_BY_ID[activeConfigId];
  const isEv = config.powertrainType === 'ev';
  const maxRpm = isEv ? 14000 : 6800;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const input: SimulationInput = {
        schemaVersion: '1.0.0',
        mode: 'single_point_powertrain',
        configurationIds: [activeConfigId],
        parameterOverrides:
          simAggregateEffOverride !== null
            ? { aggregateEfficiencyOverride: simAggregateEffOverride }
            : undefined,
        driverInputs: {
          throttle: simThrottle,
          brakeDemand: 0.0,
          steeringAngleRad: 0.0,
          gearIndex: isEv ? Math.max(-1, Math.min(1, simGearIndex)) : simGearIndex,
          primeMoverRpm: simPrimeMoverRpm,
          fourWdMode: config.id === 'vehicle.config.ice-4wd' ? fourWdMode : null,
          diffMode: simDiffMode,
          evFrontSplit:
            config.id === 'vehicle.config.ev-dual-awd' || config.id === 'vehicle.config.ice-awd'
              ? simEvFrontSplit
              : null,
        },
        environment: {
          roadGradeRad: 0.0,
          airDensityKgM3: 1.225,
          wheelMu: simWheelMu,
          gravityMps2: 9.80665,
        },
        solverConfig: {
          dtSec: 0.01,
          durationSec: 1.0,
          initialSoc: simInitialSoc,
          matchedBaselineLock: false,
        },
      };

      setSimResults({ simRunning: true });
      simulationClient
        .evaluatePowertrain(input)
        .then(({ output, durationMs }) => {
          setSimResults({
            wasmStatus: 'ready',
            simRunning: false,
            lastComputeMs: durationMs,
            simError: null,
            powertrainOutput: output,
          });
        })
        .catch((err: ErrorEnvelope) => {
          if (err?.error?.code === 'CANCELLED') return;
          setSimResults({
            simRunning: false,
            simError: err,
          });
        });
    }, 20);
    return () => window.clearTimeout(timer);
  }, [
    activeConfigId,
    config.id,
    isEv,
    simThrottle,
    simGearIndex,
    simPrimeMoverRpm,
    simDiffMode,
    simEvFrontSplit,
    simWheelMu,
    simInitialSoc,
    simAggregateEffOverride,
    fourWdMode,
    setSimResults,
  ]);

  // Reference Torque & Power Envelope Curve for Charting
  const curveSeries = useMemo(() => {
    const tPts: { x: number; y: number }[] = [];
    const pPts: { x: number; y: number }[] = [];
    if (isEv) {
      const tPeak = config.id === 'vehicle.config.ev-dual-awd' ? 510 : 310;
      const pPeak = config.id === 'vehicle.config.ev-dual-awd' ? 240 : 150;
      for (let rpm = 0; rpm <= 14000; rpm += 500) {
        const w = (2 * Math.PI * rpm) / 60;
        const tMax = w < 1e-4 ? tPeak : Math.min(tPeak, (pPeak * 1000) / w);
        const tOut = tMax * simThrottle;
        const pKw = (tOut * w) / 1000;
        tPts.push({ x: rpm, y: tOut });
        pPts.push({ x: rpm, y: pKw });
      }
    } else {
      const pts: [number, number][] = [
        [800, 135],
        [1500, 158],
        [2500, 182],
        [3500, 198],
        [4400, 205],
        [5500, 194],
        [6400, 176],
        [6800, 162],
      ];
      for (const [rpm, wot] of pts) {
        const fric = 15 + 0.0025 * rpm;
        const tOut = simThrottle * wot - (1 - simThrottle) * fric;
        const w = (2 * Math.PI * rpm) / 60;
        tPts.push({ x: rpm, y: tOut });
        pPts.push({ x: rpm, y: (tOut * w) / 1000 });
      }
    }
    return [
      { id: 'torque', label: 'Torque (N·m)', color: '#00E5FF', points: tPts },
      { id: 'power', label: 'Power (kW)', color: '#F59E0B', dashed: '5 3', points: pPts },
    ];
  }, [isEv, config.id, simThrottle]);

  const snap = powertrainOutput?.powertrainSnapshot;
  const omegaFmt = formatAngularSpeed(snap?.primeMoverOmegaRadS ?? 0, unitMode);
  const powerFmt = formatPower(snap?.primeMoverPowerW ?? 0, unitMode);
  const lossFmt = formatPower(snap?.powerLossesW ?? 0, unitMode);
  const torqueFmt = formatTorque(snap?.primeMoverTorqueNm ?? 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.9rem' }}>
      {/* Controls Panel */}
      <div className="kin-panel">
        <div className="kin-panel-header">
          <h3 className="kin-panel-title">Powertrain Controls · {config.code}</h3>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button type="button" className="kin-btn kin-btn-sm" onClick={() => setShowEq(true)}>
              <BookOpen size={13} />
              Equations
            </button>
            <button
              type="button"
              className="kin-btn kin-btn-sm"
              onClick={() => {
                setEffOverrideText('');
                resetSimToConfigDefaults();
              }}
              data-testid="powertrain-reset-btn"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>

        <div className="kin-panel-body">
          <div className="kin-slider-row">
            <div className="kin-slider-label">
              <span>{isEv ? 'Motor Speed' : 'Engine Speed'}</span>
              <span className="mono">{simPrimeMoverRpm} RPM</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxRpm}
              step={100}
              value={simPrimeMoverRpm}
              onChange={(e) => updateSimParams({ simPrimeMoverRpm: Number(e.target.value) })}
              className="kin-range"
              aria-label="Prime mover RPM"
              data-testid="sim-rpm-slider"
            />
          </div>

          <div className="kin-slider-row">
            <div className="kin-slider-label">
              <span>Throttle Demand (u_th)</span>
              <span className="mono">{Math.round(simThrottle * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={simThrottle}
              onChange={(e) => updateSimParams({ simThrottle: Number(e.target.value) })}
              className="kin-range"
              aria-label="Throttle demand"
              data-testid="sim-throttle-slider"
            />
          </div>

          {!isEv ? (
            <div style={{ marginBottom: '0.7rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                6-Speed Manual Gear Selection
              </div>
              <div style={{ display: 'flex', gap: '0.28rem', flexWrap: 'wrap' }}>
                {[-1, 0, 1, 2, 3, 4, 5, 6].map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`kin-btn kin-btn-sm mono ${simGearIndex === g ? 'kin-btn-primary' : ''}`}
                    onClick={() => updateSimParams({ simGearIndex: g })}
                  >
                    {g === -1 ? 'R' : g === 0 ? 'N' : g}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="kin-slider-row">
              <div className="kin-slider-label">
                <span>Battery State of Charge (SOC)</span>
                <span className="mono">{Math.round(simInitialSoc * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={simInitialSoc}
                onChange={(e) => updateSimParams({ simInitialSoc: Number(e.target.value) })}
                className="kin-range"
                aria-label="Initial SOC"
              />
            </div>
          )}

          {config.id === 'vehicle.config.ice-4wd' && (
            <div style={{ marginBottom: '0.7rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', marginBottom: '0.3rem' }}>
                Transfer Case Range Mode
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {(['2H', '4H', '4L'] as FourWdMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`kin-btn kin-btn-sm mono ${fourWdMode === m ? 'kin-btn-primary' : ''}`}
                    style={{ flex: 1 }}
                    onClick={() => setFourWdMode(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(config.id === 'vehicle.config.ev-dual-awd' || config.id === 'vehicle.config.ice-awd') && (
            <div className="kin-slider-row">
              <div className="kin-slider-label">
                <span>Front / Rear Torque Allocation</span>
                <span className="mono">
                  {Math.round(simEvFrontSplit * 100)}% F / {Math.round((1 - simEvFrontSplit) * 100)}% R
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={simEvFrontSplit}
                onChange={(e) => updateSimParams({ simEvFrontSplit: Number(e.target.value) })}
                className="kin-range"
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.7rem' }}>
            <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Differential Mode
              <select
                className="kin-select"
                style={{ width: '100%', marginTop: '0.25rem' }}
                value={simDiffMode}
                onChange={(e) => updateSimParams({ simDiffMode: e.target.value as DiffMode })}
              >
                {config.supportedDiffModes.map((dm) => (
                  <option key={dm} value={dm}>
                    {dm.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Surface Preset (All Wheels)
              <select
                className="kin-select"
                style={{ width: '100%', marginTop: '0.25rem' }}
                value={simWheelMu[0]}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  updateSimParams({ simWheelMu: [m, m, m, m] });
                }}
              >
                {SURFACE_PRESETS.map((sp) => (
                  <option key={sp.label} value={sp.mu}>
                    {sp.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.7rem' }}>
            <div className="kin-slider-row" style={{ marginBottom: 0 }}>
              <div className="kin-slider-label">
                <span>Left Side mu (Split-mu)</span>
                <span className="mono">{simWheelMu[0].toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1.2}
                step={0.05}
                value={simWheelMu[0]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateSimParams({ simWheelMu: [val, simWheelMu[1], val, simWheelMu[3]] });
                }}
                className="kin-range"
              />
            </div>
            <div className="kin-slider-row" style={{ marginBottom: 0 }}>
              <div className="kin-slider-label">
                <span>Right Side mu</span>
                <span className="mono">{simWheelMu[1].toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1.2}
                step={0.05}
                value={simWheelMu[1]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  updateSimParams({ simWheelMu: [simWheelMu[0], val, simWheelMu[2], val] });
                }}
                className="kin-range"
              />
            </div>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            <span>Custom Aggregate Efficiency Override (optional, 0.06–1.00)</span>
            <input
              type="number"
              step="0.01"
              placeholder="Auto stage-by-stage (no double-count)"
              value={effOverrideText}
              onChange={(e) => {
                setEffOverrideText(e.target.value);
                const parsed = Number(e.target.value);
                if (e.target.value.trim() === '') {
                  updateSimParams({ simAggregateEffOverride: null });
                } else if (Number.isFinite(parsed)) {
                  updateSimParams({ simAggregateEffOverride: parsed });
                }
              }}
              className="kin-input mono"
            />
          </label>
        </div>
      </div>

      {/* Results & Curves */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {simError && (
          <div className="kin-panel" style={{ borderColor: 'var(--accent-red)', padding: '0.75rem' }} role="alert">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#fca5a5', fontWeight: 600 }}>
              <AlertCircle size={16} />
              <span className="mono">{simError.error.code}</span>
            </div>
            <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>{simError.error.message}</div>
          </div>
        )}

        {powertrainOutput?.warnings && powertrainOutput.warnings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {powertrainOutput.warnings.map((w) => (
              <div key={w.code} className="kin-disclaimer">
                <span className="mono" style={{ fontWeight: 700 }}>{w.code}</span>
                <span>{w.message}</span>
              </div>
            ))}
          </div>
        )}

        {snap && (
          <div className="kin-panel">
            <div className="kin-panel-header">
              <h3 className="kin-panel-title">Drivetrain Torque & Power Cascade</h3>
              {lastComputeMs !== null && (
                <span className="kin-badge kin-badge-emerald mono">WASM {lastComputeMs.toFixed(2)} ms</span>
              )}
            </div>
            <div className="kin-panel-body">
              <div className="kin-metric-grid" data-testid="powertrain-metrics">
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Angular Speed</div>
                  <div className="kin-metric-value">
                    {omegaFmt.value}
                    <span className="kin-metric-unit">{omegaFmt.unit}</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Prime Mover Torque</div>
                  <div className="kin-metric-value">
                    {torqueFmt.value}
                    <span className="kin-metric-unit">{torqueFmt.unit}</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Shaft Power</div>
                  <div className="kin-metric-value">
                    {powerFmt.value}
                    <span className="kin-metric-unit">{powerFmt.unit}</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Total Tractive Force</div>
                  <div className="kin-metric-value" data-testid="metric-tractive-force">
                    {snap.tractiveForceTotalN.toFixed(1)}
                    <span className="kin-metric-unit">N</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Axle Torques (F / R)</div>
                  <div className="kin-metric-value" style={{ fontSize: '0.9rem' }}>
                    {snap.axleTorquesNm[0].toFixed(0)} / {snap.axleTorquesNm[1].toFixed(0)}
                    <span className="kin-metric-unit">N·m</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Driveshaft RPM</div>
                  <div className="kin-metric-value">
                    {snap.driveshaftRpm !== null ? snap.driveshaftRpm.toFixed(0) : 'N/A'}
                    <span className="kin-metric-unit">{snap.driveshaftRpm !== null ? 'RPM' : ''}</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Stage Losses</div>
                  <div className="kin-metric-value">
                    {lossFmt.value}
                    <span className="kin-metric-unit">{lossFmt.unit}</span>
                  </div>
                </div>
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Overall Efficiency</div>
                  <div className="kin-metric-value">
                    {(snap.overallEfficiency * 100).toFixed(1)}
                    <span className="kin-metric-unit">%</span>
                  </div>
                </div>
              </div>

              {/* Per-Wheel Torque & RPM Table */}
              <div style={{ marginTop: '0.85rem', overflowX: 'auto' }}>
                <table className="kin-table">
                  <thead>
                    <tr>
                      <th>Wheel</th>
                      <th>Torque (N·m)</th>
                      <th>Speed (RPM)</th>
                      <th>Surface mu</th>
                    </tr>
                  </thead>
                  <tbody className="mono">
                    {(['FL', 'FR', 'RL', 'RR'] as const).map((wLabel, idx) => (
                      <tr key={wLabel}>
                        <td>{wLabel}</td>
                        <td>{snap.wheelTorquesNm[idx].toFixed(1)}</td>
                        <td>{snap.wheelRpm[idx].toFixed(1)}</td>
                        <td>{simWheelMu[idx].toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isEv && snap.batteryPowerW !== null && snap.batteryPowerW !== undefined && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span className="kin-badge kin-badge-cyan mono">
                    Battery DC Power: {formatPower(snap.batteryPowerW, unitMode).value}{' '}
                    {formatPower(snap.batteryPowerW, unitMode).unit}
                  </span>
                  <span className="kin-badge mono">
                    Battery Current: {(snap.batteryCurrentA ?? 0).toFixed(1)} A
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <EngineeringChart
          title={isEv ? 'EV PMSM Torque & Power Envelope' : '2.0L NA Inline-4 Torque & Power Curve'}
          xLabel="Prime Mover Speed (RPM)"
          yLabel="Torque (N·m) / Power (kW)"
          series={curveSeries}
          height={230}
        />
      </div>

      {showEq && (
        <EquationDrawer
          equationIds={[
            'eq.powertrain.angular-velocity',
            'eq.powertrain.mechanical-power',
            'eq.powertrain.gearbox-torque',
            'eq.powertrain.tractive-force',
            'eq.powertrain.open-diff',
            'eq.powertrain.lsd-diff',
            'eq.ev.motor-envelope',
            'eq.ev.electrical-power',
          ]}
          onClose={() => setShowEq(false)}
        />
      )}
    </div>
  );
}
