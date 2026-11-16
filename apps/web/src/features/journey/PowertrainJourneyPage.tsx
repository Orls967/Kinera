import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { buildJourneyStagesForConfig } from '../../data/animations';
import { COMPONENT_BY_ID } from '../../data/components';
import { CONFIG_BY_ID } from '../../data/configs';
import { KineraViewport } from '../../scene3d/KineraViewport';
import { simulationClient } from '../../simulation/SimulationClient';
import { formatAngularSpeed, formatPower, formatTorque } from '../../simulation/units';
import { useKineraStore } from '../../store/useKineraStore';
import type { FourWdMode, PowertrainSnapshot, SimulationInput } from '../../types/kinera';

export function PowertrainJourneyPage() {
  const activeConfigId = useKineraStore((s) => s.activeConfigId);
  const unitMode = useKineraStore((s) => s.unitMode);
  const fourWdMode = useKineraStore((s) => s.fourWdMode);
  const setFourWdMode = useKineraStore((s) => s.setFourWdMode);
  const journeyPlaying = useKineraStore((s) => s.journeyPlaying);
  const setJourneyPlaying = useKineraStore((s) => s.setJourneyPlaying);
  const journeyStepIndex = useKineraStore((s) => s.journeyStepIndex);
  const setJourneyStepIndex = useKineraStore((s) => s.setJourneyStepIndex);
  const journeySpeed = useKineraStore((s) => s.journeySpeed);
  const setJourneySpeed = useKineraStore((s) => s.setJourneySpeed);
  const journeyEvRegen = useKineraStore((s) => s.journeyEvRegen);
  const setJourneyEvRegen = useKineraStore((s) => s.setJourneyEvRegen);
  const journeyEvFrontSplit = useKineraStore((s) => s.journeyEvFrontSplit);
  const setJourneyEvFrontSplit = useKineraStore((s) => s.setJourneyEvFrontSplit);
  const setCameraPreset = useKineraStore((s) => s.setCameraPreset);

  const [snapshot, setSnapshot] = useState<PowertrainSnapshot | null>(null);

  const config = CONFIG_BY_ID[activeConfigId];
  const stages = useMemo(
    () => buildJourneyStagesForConfig(config, { evRegenMode: journeyEvRegen, fourWdMode }),
    [config, journeyEvRegen, fourWdMode],
  );

  const safeIdx = Math.min(journeyStepIndex, Math.max(0, stages.length - 1));
  const currentStage = stages[safeIdx];

  useEffect(() => {
    if (currentStage?.cameraPreset) {
      setCameraPreset(currentStage.cameraPreset);
    }
  }, [safeIdx, currentStage?.cameraPreset, setCameraPreset]);

  useEffect(() => {
    if (!journeyPlaying) return;
    const intervalMs = Math.round(2800 / journeySpeed);
    const id = window.setInterval(() => {
      const next = (useKineraStore.getState().journeyStepIndex + 1) % stages.length;
      setJourneyStepIndex(next);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [journeyPlaying, journeySpeed, stages.length, setJourneyStepIndex]);

  // Keep telemetry synchronized with shared Rust/WASM powertrain solver
  useEffect(() => {
    let cancelled = false;
    const input: SimulationInput = {
      schemaVersion: '1.0.0',
      mode: 'single_point_powertrain',
      configurationIds: [activeConfigId],
      driverInputs: {
        throttle: journeyEvRegen ? 0.0 : 0.85,
        brakeDemand: journeyEvRegen ? 0.65 : 0.0,
        steeringAngleRad: 0.0,
        gearIndex: config.powertrainType === 'ev' ? 1 : 3,
        primeMoverRpm: config.powertrainType === 'ev' ? 3600 : 3500,
        fourWdMode: config.id === 'vehicle.config.ice-4wd' ? fourWdMode : null,
        diffMode:
          config.id === 'vehicle.config.ev-dual-awd'
            ? 'ev_electronic'
            : config.id === 'vehicle.config.ice-awd'
              ? 'center_diff'
              : 'open',
        evFrontSplit: config.id === 'vehicle.config.ev-dual-awd' ? journeyEvFrontSplit : null,
      },
      environment: {
        roadGradeRad: 0,
        airDensityKgM3: 1.225,
        wheelMu: [0.9, 0.9, 0.9, 0.9],
        gravityMps2: 9.80665,
      },
      solverConfig: {
        dtSec: 0.01,
        durationSec: 1.0,
        initialSoc: 0.72,
        matchedBaselineLock: false,
      },
    };
    simulationClient
      .evaluatePowertrain(input)
      .then(({ output }) => {
        if (!cancelled && output.powertrainSnapshot) {
          setSnapshot(output.powertrainSnapshot);
        }
      })
      .catch(() => {
        // Ignore superseded cancellation
      });
    return () => {
      cancelled = true;
    };
  }, [activeConfigId, config.id, config.powertrainType, fourWdMode, journeyEvRegen, journeyEvFrontSplit]);

  const highlightIds = useMemo(
    () => new Set(currentStage?.componentIds ?? []),
    [currentStage],
  );

  const pmOmega = snapshot?.primeMoverOmegaRadS ?? 0;
  const pmFmt = formatAngularSpeed(pmOmega, unitMode);
  const pmPower = formatPower(snapshot?.primeMoverPowerW ?? 0, unitMode);
  const lossFmt = formatPower(snapshot?.powerLossesW ?? 0, unitMode);
  const pmTorque = formatTorque(snapshot?.primeMoverTorqueNm ?? 0);

  return (
    <div className="kin-lab-workspace">
      {/* Left Rail: Ordered Journey Sequence */}
      <aside className="kin-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="kin-panel-header">
          <h2 className="kin-panel-title">Powertrain Sequence</h2>
          <span className="kin-badge mono">{config.code}</span>
        </div>

        <div className="kin-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
          {config.powertrainType === 'ev' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.4rem' }}>
              <button
                type="button"
                className={`kin-btn kin-btn-sm ${journeyEvRegen ? 'kin-btn-primary' : ''}`}
                onClick={() => setJourneyEvRegen(!journeyEvRegen)}
                data-testid="journey-regen-toggle"
              >
                <Zap size={13} />
                Mode: {journeyEvRegen ? 'Regenerative Braking' : 'Propulsion'}
              </button>
              {config.id === 'vehicle.config.ev-dual-awd' && (
                <div className="kin-slider-row" style={{ marginBottom: 0 }}>
                  <div className="kin-slider-label">
                    <span>Front/Rear Split</span>
                    <span className="mono">
                      {Math.round(journeyEvFrontSplit * 100)}% / {Math.round((1 - journeyEvFrontSplit) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={journeyEvFrontSplit}
                    onChange={(e) => setJourneyEvFrontSplit(Number(e.target.value))}
                    className="kin-range"
                  />
                </div>
              )}
            </div>
          )}

          {config.id === 'vehicle.config.ice-4wd' && (
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.35rem' }}>
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
          )}

          {stages.map((st, idx) => {
            const active = idx === safeIdx;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setJourneyPlaying(false);
                  setJourneyStepIndex(idx);
                }}
                style={{
                  textAlign: 'left',
                  padding: '0.55rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: active ? '1px solid var(--accent-cyan)' : '1px solid var(--border-hairline)',
                  background: active ? 'var(--accent-cyan-dim)' : 'rgba(14,17,22,0.55)',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{st.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{st.subtitle}</div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Center: 3D Stage & Playback Transport */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: 0 }}>
        <div style={{ position: 'relative', flex: 1, minHeight: 500 }}>
          <KineraViewport
            height="100%"
            journeyHighlightIds={highlightIds}
            regenMode={config.powertrainType === 'ev' && journeyEvRegen}
          />
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            <span className="kin-badge kin-badge-cyan">
              Step {safeIdx + 1} / {stages.length}
            </span>
            <span className="kin-badge mono">{currentStage?.flowMode?.toUpperCase()}</span>
          </div>
        </div>

        <div
          className="kin-panel"
          style={{
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              type="button"
              className="kin-btn kin-btn-sm"
              onClick={() => {
                setJourneyPlaying(false);
                setJourneyStepIndex(Math.max(0, safeIdx - 1));
              }}
              aria-label="Previous stage"
            >
              <ChevronLeft size={15} />
              Prev
            </button>
            <button
              type="button"
              className="kin-btn kin-btn-sm kin-btn-primary"
              onClick={() => setJourneyPlaying(!journeyPlaying)}
              data-testid="journey-play-pause"
            >
              {journeyPlaying ? <Pause size={14} /> : <Play size={14} />}
              {journeyPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              className="kin-btn kin-btn-sm"
              onClick={() => {
                setJourneyPlaying(false);
                setJourneyStepIndex((safeIdx + 1) % stages.length);
              }}
              aria-label="Next stage"
              data-testid="journey-next-btn"
            >
              Next
              <ChevronRight size={15} />
            </button>
            <button
              type="button"
              className="kin-btn kin-btn-sm"
              onClick={() => {
                setJourneyPlaying(false);
                setJourneyStepIndex(0);
              }}
              data-testid="journey-restart-btn"
            >
              <RotateCcw size={13} />
              Restart
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Speed</span>
            {([0.5, 1, 2] as const).map((sp) => (
              <button
                key={sp}
                type="button"
                className={`kin-btn kin-btn-sm mono ${journeySpeed === sp ? 'kin-btn-primary' : ''}`}
                onClick={() => setJourneySpeed(sp)}
              >
                {sp}x
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Right Rail: Stage Explanation & Synchronized Telemetry */}
      <aside className="kin-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="kin-panel-header">
          <h2 className="kin-panel-title">Stage Engineering Telemetry</h2>
          <span className="kin-badge kin-badge-emerald mono">WASM Sync</span>
        </div>

        <div className="kin-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {currentStage && (
            <>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{currentStage.title}</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                  {currentStage.subtitle}
                </div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {currentStage.explanation}
                </p>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Active Stage Components
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {currentStage.componentIds.map((cid) => (
                    <span key={cid} className="kin-badge mono" style={{ fontSize: '0.7rem' }}>
                      {COMPONENT_BY_ID[cid]?.name ?? cid}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {snapshot && (
            <div className="kin-metric-grid">
              <div className="kin-metric-card">
                <div className="kin-metric-label">Prime Mover Speed</div>
                <div className="kin-metric-value">
                  {pmFmt.value}
                  <span className="kin-metric-unit">{pmFmt.unit}</span>
                </div>
              </div>
              <div className="kin-metric-card">
                <div className="kin-metric-label">Prime Mover Torque</div>
                <div className="kin-metric-value">
                  {pmTorque.value}
                  <span className="kin-metric-unit">{pmTorque.unit}</span>
                </div>
              </div>
              <div className="kin-metric-card">
                <div className="kin-metric-label">Shaft Power</div>
                <div className="kin-metric-value">
                  {pmPower.value}
                  <span className="kin-metric-unit">{pmPower.unit}</span>
                </div>
              </div>
              <div className="kin-metric-card">
                <div className="kin-metric-label">Drivetrain Losses</div>
                <div className="kin-metric-value">
                  {lossFmt.value}
                  <span className="kin-metric-unit">{lossFmt.unit}</span>
                </div>
              </div>
              <div className="kin-metric-card">
                <div className="kin-metric-label">Total Axle Torque (F/R)</div>
                <div className="kin-metric-value" style={{ fontSize: '0.86rem' }}>
                  {snapshot.axleTorquesNm[0].toFixed(0)} / {snapshot.axleTorquesNm[1].toFixed(0)}
                  <span className="kin-metric-unit">N·m</span>
                </div>
              </div>
              <div className="kin-metric-card">
                <div className="kin-metric-label">Tractive Force</div>
                <div className="kin-metric-value">
                  {snapshot.tractiveForceTotalN.toFixed(0)}
                  <span className="kin-metric-unit">N</span>
                </div>
              </div>
              <div className="kin-metric-card">
                <div className="kin-metric-label">Overall Efficiency</div>
                <div className="kin-metric-value">
                  {(snapshot.overallEfficiency * 100).toFixed(1)}
                  <span className="kin-metric-unit">%</span>
                </div>
              </div>
              {snapshot.driveshaftRpm !== null && (
                <div className="kin-metric-card">
                  <div className="kin-metric-label">Driveshaft Speed</div>
                  <div className="kin-metric-value">
                    {snapshot.driveshaftRpm.toFixed(0)}
                    <span className="kin-metric-unit">RPM</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
