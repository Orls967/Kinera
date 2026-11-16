import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { VEHICLE_CONFIGURATIONS } from '../../data/configs';
import { simulationClient } from '../../simulation/SimulationClient';
import { formatSpeed } from '../../simulation/units';
import { EngineeringChart } from '../../shared/EngineeringChart';
import { useKineraStore } from '../../store/useKineraStore';
import type { ConfigId, ErrorEnvelope, SimulationInput } from '../../types/kinera';

const SERIES_COLORS = ['#00E5FF', '#3B82F6', '#F59E0B', '#10B981', '#A855F7', '#FB7185', '#CBD5E1'];

export function ComparisonSimTab() {
  const unitMode = useKineraStore((s) => s.unitMode);
  const comparisonConfigIds = useKineraStore((s) => s.comparisonConfigIds);
  const setComparisonConfigIds = useKineraStore((s) => s.setComparisonConfigIds);
  const matchedBaselineLock = useKineraStore((s) => s.matchedBaselineLock);
  const setMatchedBaselineLock = useKineraStore((s) => s.setMatchedBaselineLock);
  const simWheelMu = useKineraStore((s) => s.simWheelMu);
  const updateSimParams = useKineraStore((s) => s.updateSimParams);
  const comparisonOutput = useKineraStore((s) => s.comparisonOutput);
  const lastComputeMs = useKineraStore((s) => s.lastComputeMs);
  const setSimResults = useKineraStore((s) => s.setSimResults);

  const toggleConfig = (id: ConfigId) => {
    if (comparisonConfigIds.includes(id)) {
      if (comparisonConfigIds.length <= 2) return; // keep >= 2 configs
      setComparisonConfigIds(comparisonConfigIds.filter((c) => c !== id));
    } else {
      setComparisonConfigIds([...comparisonConfigIds, id]);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const input: SimulationInput = {
        schemaVersion: '1.0.0',
        mode: 'multi_config_comparison',
        configurationIds: comparisonConfigIds,
        driverInputs: {
          throttle: 1.0,
          brakeDemand: 0.0,
          steeringAngleRad: 0.0,
          gearIndex: 1,
          primeMoverRpm: null,
          fourWdMode: comparisonConfigIds.includes('vehicle.config.ice-4wd') ? '4H' : null,
          diffMode: 'open',
          evFrontSplit: 0.4,
        },
        environment: {
          roadGradeRad: 0.0,
          airDensityKgM3: 1.225,
          wheelMu: simWheelMu,
          gravityMps2: 9.80665,
        },
        solverConfig: {
          dtSec: 0.01,
          durationSec: 6.0,
          initialSpeedMps: 0.0,
          initialSoc: 0.85,
          absConceptualEnabled: true,
          matchedBaselineLock,
        },
      };

      setSimResults({ simRunning: true });
      simulationClient
        .runComparison(input)
        .then(({ output, durationMs }) => {
          setSimResults({
            wasmStatus: 'ready',
            simRunning: false,
            lastComputeMs: durationMs,
            comparisonOutput: output,
          });
        })
        .catch((err: ErrorEnvelope) => {
          if (err?.error?.code === 'CANCELLED') return;
          setSimResults({ simRunning: false, simError: err });
        });
    }, 30);
    return () => window.clearTimeout(timer);
  }, [comparisonConfigIds, matchedBaselineLock, simWheelMu, setSimResults]);

  const entries = useMemo(() => comparisonOutput?.comparisonEntries ?? [], [comparisonOutput]);
  const diffs = comparisonOutput?.comparisonDiffs ?? [];
  const hasDifferences = diffs.some((d) => d.status === 'DIFFERENT');

  const speedMul = unitMode === 'si' ? 1 : 3.6;
  const speedUnit = unitMode === 'si' ? 'm/s' : 'km/h';

  const speedSeries = useMemo(
    () =>
      entries.map((entry, idx) => ({
        id: entry.configurationId,
        label: entry.code,
        color: SERIES_COLORS[idx % SERIES_COLORS.length],
        points: entry.timeSeries.map((f) => ({ x: f.timeSec, y: f.speedMps * speedMul })),
      })),
    [entries, speedMul],
  );

  const tractiveSeries = useMemo(
    () =>
      entries.map((entry, idx) => ({
        id: `${entry.configurationId}-fx`,
        label: entry.code,
        color: SERIES_COLORS[idx % SERIES_COLORS.length],
        points: entry.timeSeries.map((f) => ({ x: f.timeSec, y: f.tractiveForceN })),
      })),
    [entries],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {/* Comparison Configuration Bar */}
      <div className="kin-panel" style={{ padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.7rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {VEHICLE_CONFIGURATIONS.map((cfg) => {
              const active = comparisonConfigIds.includes(cfg.id);
              return (
                <button
                  key={cfg.id}
                  type="button"
                  className={`kin-btn kin-btn-sm mono ${active ? 'kin-btn-primary' : ''}`}
                  onClick={() => toggleConfig(cfg.id)}
                  data-testid={`compare-toggle-${cfg.code}`}
                >
                  {cfg.code}
                </button>
              );
            })}
            <button
              type="button"
              className="kin-btn kin-btn-sm"
              onClick={() => setComparisonConfigIds(VEHICLE_CONFIGURATIONS.map((c) => c.id))}
            >
              Select All 7
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`kin-btn kin-btn-sm ${matchedBaselineLock ? 'kin-btn-primary' : ''}`}
              onClick={() => setMatchedBaselineLock(!matchedBaselineLock)}
              data-testid="matched-baseline-toggle"
            >
              {matchedBaselineLock ? 'Matched Baseline: ON' : 'Matched Baseline: OFF (Native Specs)'}
            </button>

            <select
              aria-label="Comparison surface mu"
              className="kin-select mono"
              value={simWheelMu[0]}
              onChange={(e) => {
                const m = Number(e.target.value);
                updateSimParams({ simWheelMu: [m, m, m, m] });
              }}
            >
              <option value={0.9}>Dry Asphalt (mu=0.90)</option>
              <option value={0.55}>Wet Asphalt (mu=0.55)</option>
              <option value={0.3}>Snow (mu=0.30)</option>
              <option value={0.15}>Ice (mu=0.15)</option>
            </select>

            {lastComputeMs !== null && (
              <span className="kin-badge kin-badge-emerald mono">WASM {lastComputeMs.toFixed(1)} ms</span>
            )}
          </div>
        </div>

        {hasDifferences && (
          <div className="kin-disclaimer">
            <AlertTriangle size={15} />
            <span>
              <strong>Variable Difference Detected:</strong> Differing vehicle/powertrain parameters (such as natural
              peak power, static weight distribution, or unladen mass when Matched Baseline is off) are flagged below.
              No universal winner is declared—inspect the physical trade-offs.
            </span>
          </div>
        )}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
        <EngineeringChart
          title={`Launch Speed vs. Time (${speedUnit})`}
          xLabel="Time (s)"
          yLabel={`Speed (${speedUnit})`}
          series={speedSeries}
          height={235}
        />
        <EngineeringChart
          title="Net Tractive Force vs. Time (N)"
          xLabel="Time (s)"
          yLabel="Tractive Force (N)"
          series={tractiveSeries}
          height={235}
        />
      </div>

      {/* Quantitative Comparison Matrix */}
      {entries.length > 0 && (
        <div className="kin-panel" style={{ overflowX: 'auto' }}>
          <div className="kin-panel-header">
            <h3 className="kin-panel-title">Controlled Architecture Trade-Off Matrix</h3>
            <span className="kin-badge kin-badge-amber">Simulated Model Estimate</span>
          </div>
          <table className="kin-table" data-testid="comparison-results-table">
            <thead>
              <tr>
                <th>Configuration</th>
                <th>0–100 km/h (s)</th>
                <th>1/4 Mile (s)</th>
                <th>Top Speed ({speedUnit})</th>
                <th>100–0 Brake (m)</th>
                <th>Drivetrain η</th>
                <th>Cruise Wh/km</th>
                <th>Power/Weight</th>
              </tr>
            </thead>
            <tbody className="mono">
              {entries.map((entry) => {
                const m = entry.summaryMetrics;
                return (
                  <tr key={entry.configurationId}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{entry.code}</td>
                    <td>{m.zeroTo100KmhSec?.value.toFixed(2) ?? '—'}</td>
                    <td>{m.quarterMileSec?.value.toFixed(2) ?? '—'}</td>
                    <td>{formatSpeed(m.topSpeedMps?.value ?? 0, unitMode).value}</td>
                    <td>{m.braking100To0M?.value.toFixed(1) ?? '—'}</td>
                    <td>{(entry.powertrainSnapshot.overallEfficiency * 100).toFixed(1)}%</td>
                    <td>{m.cruiseEnergyWhPerKm?.value.toFixed(0) ?? '—'}</td>
                    <td>{m.powerToWeightWPerKg?.value.toFixed(1) ?? '—'} W/kg</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Parameter Divergence Audit Table */}
      {diffs.length > 0 && (
        <div className="kin-panel" style={{ overflowX: 'auto' }}>
          <div className="kin-panel-header">
            <h3 className="kin-panel-title">Parameter Baseline Audit</h3>
          </div>
          <table className="kin-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Status</th>
                <th>Values by Configuration</th>
              </tr>
            </thead>
            <tbody className="mono">
              {diffs.map((d) => (
                <tr key={d.parameterName}>
                  <td>{d.parameterName}</td>
                  <td>
                    <span className={`kin-badge ${d.status === 'MATCHED' ? 'kin-badge-emerald' : 'kin-badge-amber'}`}>
                      {d.status === 'MATCHED' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {d.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    {Object.entries(d.valuesByConfig)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
