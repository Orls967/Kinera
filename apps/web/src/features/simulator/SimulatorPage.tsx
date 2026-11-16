import { Download, Info, Layers, Scale, Sliders } from 'lucide-react';
import { useState } from 'react';
import { CONFIG_BY_ID } from '../../data/configs';
import { useKineraStore } from '../../store/useKineraStore';
import { ComparisonSimTab } from './ComparisonSimTab';
import { DynamicsSimTab } from './DynamicsSimTab';
import { PowertrainSimTab } from './PowertrainSimTab';

type SimModuleTab = 'powertrain' | 'dynamics' | 'comparison';

export function SimulatorPage() {
  const [activeTab, setActiveTab] = useState<SimModuleTab>('powertrain');
  const activeConfigId = useKineraStore((s) => s.activeConfigId);
  const wasmStatus = useKineraStore((s) => s.wasmStatus);
  const powertrainOutput = useKineraStore((s) => s.powertrainOutput);
  const dynamicsOutput = useKineraStore((s) => s.dynamicsOutput);
  const comparisonOutput = useKineraStore((s) => s.comparisonOutput);
  const config = CONFIG_BY_ID[activeConfigId];

  const handleExportJson = () => {
    const payload =
      activeTab === 'powertrain'
        ? powertrainOutput
        : activeTab === 'dynamics'
          ? dynamicsOutput
          : comparisonOutput;
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kinera-${config.code.toLowerCase()}-${activeTab}.kinera.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 1640, margin: '0 auto', padding: '1rem 1.25rem 2.5rem', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '0.85rem',
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', margin: '0 0 0.2rem' }}>
            Engineering Simulator
          </h1>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Active Platform: <strong style={{ color: 'var(--accent-cyan)' }}>{config.code}</strong> — {config.name}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className={`kin-badge mono ${wasmStatus === 'degraded' ? 'kin-badge-red' : 'kin-badge-emerald'}`}>
            Engine: {wasmStatus === 'degraded' ? 'WASM Degraded' : 'Rust/WASM Worker'}
          </span>
          <button
            type="button"
            className="kin-btn kin-btn-sm"
            onClick={handleExportJson}
            disabled={!powertrainOutput && !dynamicsOutput && !comparisonOutput}
          >
            <Download size={13} />
            Export .kinera.json
          </button>
        </div>
      </div>

      {/* Mandatory Disclosure Banner */}
      <div className="kin-disclaimer" style={{ marginBottom: '0.9rem' }}>
        <Info size={16} />
        <span>
          <strong>Simulated Model Estimate:</strong> All outputs execute deterministically inside the Rust/WASM physics
          worker using strict SI units under documented V1 reduced-order educational assumptions (steady-state engine/motor
          curves, quasi-static load transfer, 2-DOF linear bicycle model). Not verified production vehicle telemetry.
        </span>
      </div>

      {/* Simulator Module Selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`kin-btn ${activeTab === 'powertrain' ? 'kin-btn-primary' : ''}`}
          onClick={() => setActiveTab('powertrain')}
          data-testid="sim-tab-powertrain"
        >
          <Sliders size={15} />
          Powertrain Simulation
        </button>
        <button
          type="button"
          className={`kin-btn ${activeTab === 'dynamics' ? 'kin-btn-primary' : ''}`}
          onClick={() => setActiveTab('dynamics')}
          data-testid="sim-tab-dynamics"
        >
          <Layers size={15} />
          Vehicle Dynamics Simulation
        </button>
        <button
          type="button"
          className={`kin-btn ${activeTab === 'comparison' ? 'kin-btn-primary' : ''}`}
          onClick={() => setActiveTab('comparison')}
          data-testid="sim-tab-comparison"
        >
          <Scale size={15} />
          Configuration Comparison
        </button>
      </div>

      {activeTab === 'powertrain' && <PowertrainSimTab />}
      {activeTab === 'dynamics' && <DynamicsSimTab />}
      {activeTab === 'comparison' && <ComparisonSimTab />}
    </div>
  );
}
