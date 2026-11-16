import { ArrowRight, Compass, Cpu, Eye, Gauge, Layers, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CONFIG_BY_ID, VEHICLE_CONFIGURATIONS } from '../../data/configs';
import { KineraViewport } from '../../scene3d/KineraViewport';
import { useKineraStore } from '../../store/useKineraStore';
import type { CameraPresetId, ConfigId } from '../../types/kinera';

export function OverviewPage() {
  const navigate = useNavigate();
  const activeConfigId = useKineraStore((s) => s.activeConfigId);
  const setActiveConfigId = useKineraStore((s) => s.setActiveConfigId);
  const overviewRevealMode = useKineraStore((s) => s.overviewRevealMode);
  const setOverviewRevealMode = useKineraStore((s) => s.setOverviewRevealMode);
  const turntableEnabled = useKineraStore((s) => s.turntableEnabled);
  const setTurntableEnabled = useKineraStore((s) => s.setTurntableEnabled);
  const setCameraPreset = useKineraStore((s) => s.setCameraPreset);
  const activeCfg = CONFIG_BY_ID[activeConfigId];

  const handleSelectConfig = (id: ConfigId) => {
    setActiveConfigId(id);
  };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '1rem 1.25rem 2.5rem', width: '100%' }}>
      {/* Hero Showcase */}
      <section
        className="kin-panel"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          overflow: 'hidden',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span className="kin-badge kin-badge-cyan">AUTOMOTIVE ENGINEERING LAB</span>
              <span className="kin-badge mono">{activeCfg.code}</span>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.65rem, 2.7vw, 2.35rem)',
                lineHeight: 1.15,
                margin: '0 0 0.65rem',
              }}
            >
              Explore the Mechanics.
              <br />
              <span style={{ color: 'var(--accent-cyan)' }}>Understand the Motion.</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.55, margin: 0 }}>
              KINERA is an interactive automotive powertrain and vehicle dynamics laboratory. Switch seamlessly across
              seven canonical ICE and EV architectures, inspect cutaway 3D assemblies, trace torque and electrical
              power flow, and execute deterministic Rust/WASM physics simulations.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(14,17,22,0.72)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.8rem 0.95rem',
            }}
          >
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Active Laboratory Configuration
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{activeCfg.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{activeCfg.learningFocus}</div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="kin-btn kin-btn-primary"
              onClick={() => navigate('/anatomy')}
            >
              <Layers size={15} />
              Open Vehicle Anatomy
              <ArrowRight size={14} />
            </button>
            <button type="button" className="kin-btn" onClick={() => navigate('/journey')}>
              Powertrain Journey
            </button>
            <button type="button" className="kin-btn" onClick={() => navigate('/simulator')}>
              <Gauge size={15} />
              Engineering Simulator
            </button>
          </div>
        </div>

        <div style={{ position: 'relative', minHeight: 430 }}>
          <KineraViewport autoRotate={turntableEnabled} height={460} />
          <div
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              left: '0.75rem',
              right: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              pointerEvents: 'none',
            }}
          >
            <div style={{ display: 'flex', gap: '0.35rem', pointerEvents: 'auto', flexWrap: 'wrap' }}>
              {(['exterior', 'chassis', 'powertrain'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`kin-btn kin-btn-sm ${overviewRevealMode === mode ? 'kin-btn-primary' : ''}`}
                  onClick={() => setOverviewRevealMode(mode)}
                >
                  <Eye size={13} />
                  {mode === 'exterior' ? 'Exterior' : mode === 'chassis' ? 'Chassis Reveal' : 'Powertrain Reveal'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', pointerEvents: 'auto' }}>
              <button
                type="button"
                className={`kin-btn kin-btn-sm ${turntableEnabled ? 'kin-btn-primary' : ''}`}
                onClick={() => setTurntableEnabled(!turntableEnabled)}
              >
                <RotateCw size={13} />
                360° Turntable
              </button>
              <button
                type="button"
                className="kin-btn kin-btn-sm"
                onClick={() => setCameraPreset('isometric-front' as CameraPresetId)}
              >
                Reset Cam
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Seven Canonical Configurations Matrix */}
      <section style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: 0 }}>
            Seven Canonical Vehicle Configurations
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Unified configuration-driven topology across ICE and EV platforms
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.75rem' }}>
          {VEHICLE_CONFIGURATIONS.map((cfg) => {
            const isSelected = cfg.id === activeConfigId;
            return (
              <div
                key={cfg.id}
                className="kin-panel"
                style={{
                  padding: '0.9rem',
                  borderColor: isSelected ? 'var(--accent-cyan)' : undefined,
                  background: isSelected ? 'rgba(0, 229, 255, 0.06)' : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.55rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className={`kin-badge mono ${cfg.powertrainType === 'ev' ? 'kin-badge-cyan' : 'kin-badge-amber'}`}>
                      {cfg.code}
                    </span>
                    <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {cfg.topology.drivenAxles.join('+').toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', marginBottom: '0.3rem' }}>{cfg.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Mass: <span className="mono">{cfg.specification.massKg} kg</span> · CG h:{' '}
                    <span className="mono">{cfg.specification.cgHeightM} m</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    className={`kin-btn kin-btn-sm ${isSelected ? 'kin-btn-primary' : ''}`}
                    style={{ flex: 1 }}
                    onClick={() => handleSelectConfig(cfg.id)}
                  >
                    {isSelected ? 'Active' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    className="kin-btn kin-btn-sm"
                    onClick={() => {
                      handleSelectConfig(cfg.id);
                      navigate('/anatomy');
                    }}
                  >
                    3D
                  </button>
                  <button
                    type="button"
                    className="kin-btn kin-btn-sm"
                    onClick={() => {
                      handleSelectConfig(cfg.id);
                      navigate('/simulator');
                    }}
                  >
                    Sim
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Three Product Pillars */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
        <div className="kin-panel" style={{ padding: '1rem 1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
            <Compass size={17} />
            <strong>Pillar 1 · Vehicle Architecture</strong>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.7rem', lineHeight: 1.5 }}>
            Compare transverse transaxles, longitudinal driveshafts, center differentials, 2H/4H/4L transfer cases, and
            single/dual e-axles inside a shared interactive CAD cutaway.
          </p>
          <button type="button" className="kin-btn kin-btn-sm" onClick={() => navigate('/anatomy')}>
            Explore Vehicle Anatomy
          </button>
        </div>

        <div className="kin-panel" style={{ padding: '1rem 1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)', marginBottom: '0.4rem' }}>
            <Cpu size={17} />
            <strong>Pillar 2 · Powertrain Engineering</strong>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.7rem', lineHeight: 1.5 }}>
            Trace energy conversion from combustion or battery chemistry through gearboxes, stage efficiency losses,
            Open/LSD/Locked differentials, and bidirectional EV regeneration.
          </p>
          <button type="button" className="kin-btn kin-btn-sm" onClick={() => navigate('/journey')}>
            Launch Powertrain Journey
          </button>
        </div>

        <div className="kin-panel" style={{ padding: '1rem 1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', marginBottom: '0.4rem' }}>
            <Gauge size={17} />
            <strong>Pillar 3 · Vehicle Dynamics</strong>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.7rem', lineHeight: 1.5 }}>
            Run Rust/WASM RK4 simulations for longitudinal acceleration, 2-DOF linear bicycle cornering, quasi-static
            weight transfer, braking bias, friction circles, and matched-baseline comparisons.
          </p>
          <button type="button" className="kin-btn kin-btn-sm" onClick={() => navigate('/simulator')}>
            Open Engineering Simulator
          </button>
        </div>
      </section>
    </div>
  );
}
