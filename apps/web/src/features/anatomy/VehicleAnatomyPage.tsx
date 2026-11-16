import {
  Activity,
  BookOpen,
  Eye,
  EyeOff,
  Filter,
  GitBranch,
  Layers,
  RotateCcw,
  Scissors,
  Search,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMPONENT_BY_ID, COMPONENTS } from '../../data/components';
import { CONFIG_BY_ID } from '../../data/configs';
import { KineraViewport } from '../../scene3d/KineraViewport';
import { EquationDrawer } from '../../shared/EquationDrawer';
import { useKineraStore } from '../../store/useKineraStore';
import type { CameraPresetId, FourWdMode, SystemLayerId } from '../../types/kinera';

const LAYER_LABELS: { id: SystemLayerId; label: string }[] = [
  { id: 'exterior', label: 'Exterior Shell' },
  { id: 'structure', label: 'Structure' },
  { id: 'powerplant', label: 'Powerplant (ICE/EV)' },
  { id: 'drivetrain', label: 'Transmission & Drivetrain' },
  { id: 'suspension', label: 'Suspension & Steering' },
  { id: 'braking', label: 'Braking System' },
  { id: 'wheels', label: 'Wheels & Tires' },
];

const CAMERA_PRESETS: { id: CameraPresetId; label: string }[] = [
  { id: 'isometric-front', label: '3/4 Front' },
  { id: 'side-profile', label: 'Side' },
  { id: 'top-plan', label: 'Top' },
  { id: 'front-axle', label: 'Front Axle' },
  { id: 'rear-axle', label: 'Rear Axle' },
  { id: 'underbody-drivetrain', label: 'Underbody' },
  { id: 'powertrain-focus', label: 'Powertrain' },
];

export function VehicleAnatomyPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showEqDrawer, setShowEqDrawer] = useState(false);

  const activeConfigId = useKineraStore((s) => s.activeConfigId);
  const selectedComponentId = useKineraStore((s) => s.selectedComponentId);
  const selectComponent = useKineraStore((s) => s.selectComponent);
  const isolatedComponentId = useKineraStore((s) => s.isolatedComponentId);
  const isolateComponent = useKineraStore((s) => s.isolateComponent);
  const soloIsolation = useKineraStore((s) => s.soloIsolation);
  const setSoloIsolation = useKineraStore((s) => s.setSoloIsolation);
  const visibleLayers = useKineraStore((s) => s.visibleLayers);
  const toggleLayer = useKineraStore((s) => s.toggleLayer);
  const setLayerPreset = useKineraStore((s) => s.setLayerPreset);
  const explodeFactor = useKineraStore((s) => s.explodeFactor);
  const setExplodeFactor = useKineraStore((s) => s.setExplodeFactor);
  const shellTransparency = useKineraStore((s) => s.shellTransparency);
  const setShellTransparency = useKineraStore((s) => s.setShellTransparency);
  const sectionCutEnabled = useKineraStore((s) => s.sectionCutEnabled);
  const setSectionCutEnabled = useKineraStore((s) => s.setSectionCutEnabled);
  const sectionCutAxis = useKineraStore((s) => s.sectionCutAxis);
  const setSectionCutAxis = useKineraStore((s) => s.setSectionCutAxis);
  const sectionCutOffset = useKineraStore((s) => s.sectionCutOffset);
  const setSectionCutOffset = useKineraStore((s) => s.setSectionCutOffset);
  const showPowerFlow = useKineraStore((s) => s.showPowerFlow);
  const setShowPowerFlow = useKineraStore((s) => s.setShowPowerFlow);
  const showRelationships = useKineraStore((s) => s.showRelationships);
  const setShowRelationships = useKineraStore((s) => s.setShowRelationships);
  const cameraPreset = useKineraStore((s) => s.cameraPreset);
  const setCameraPreset = useKineraStore((s) => s.setCameraPreset);
  const fourWdMode = useKineraStore((s) => s.fourWdMode);
  const setFourWdMode = useKineraStore((s) => s.setFourWdMode);
  const qualityTier = useKineraStore((s) => s.qualityTier);
  const setQualityTier = useKineraStore((s) => s.setQualityTier);
  const sceneStats = useKineraStore((s) => s.sceneStats);
  const resetAssembly = useKineraStore((s) => s.resetAssembly);

  const config = CONFIG_BY_ID[activeConfigId];

  const activeComponents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return COMPONENTS.filter(
      (c) =>
        c.vehicleConfigurations.includes(activeConfigId) &&
        (!q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)),
    );
  }, [activeConfigId, searchTerm]);

  const groupedComponents = useMemo(() => {
    const map = new Map<SystemLayerId, typeof activeComponents>();
    for (const l of LAYER_LABELS) map.set(l.id, []);
    for (const comp of activeComponents) {
      map.get(comp.layer)?.push(comp);
    }
    return map;
  }, [activeComponents]);

  const selectedComp = selectedComponentId ? COMPONENT_BY_ID[selectedComponentId] : null;
  const upstreamRels = useMemo(
    () =>
      selectedComp
        ? selectedComp.relationships.filter(
            (r) => r.targetId === selectedComp.id && r.vehicleConfigurations.includes(activeConfigId),
          )
        : [],
    [selectedComp, activeConfigId],
  );
  const downstreamRels = useMemo(
    () =>
      selectedComp
        ? selectedComp.relationships.filter(
            (r) => r.sourceId === selectedComp.id && r.vehicleConfigurations.includes(activeConfigId),
          )
        : [],
    [selectedComp, activeConfigId],
  );

  return (
    <div className="kin-lab-workspace">
      {/* Left Rail: Hierarchy Tree & View Modes */}
      <aside className="kin-panel" style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 92px)' }}>
        <div className="kin-panel-header">
          <h2 className="kin-panel-title">Assembly Hierarchy</h2>
          <span className="kin-badge mono">{config.code}</span>
        </div>

        <div className="kin-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {(['full', 'powertrain', 'chassis', 'suspension', 'braking'] as const).map((preset) => (
              <button
                key={preset}
                type="button"
                className="kin-btn kin-btn-sm"
                onClick={() => setLayerPreset(preset)}
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </button>
            ))}
          </div>

          {config.id === 'vehicle.config.ice-4wd' && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: '0.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', marginBottom: '0.35rem', fontWeight: 600 }}>
                4WD Transfer Case Mode
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

          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 9, top: 10, color: 'var(--text-muted)' }} />
            <input
              type="search"
              className="kin-input"
              placeholder="Filter canonical ID or part..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '1.8rem' }}
              aria-label="Filter components"
            />
          </div>

          {/* Layer Visibility + Component Tree */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {LAYER_LABELS.map((layer) => {
              const items = groupedComponents.get(layer.id) ?? [];
              const layerOn = visibleLayers[layer.id];
              return (
                <div
                  key={layer.id}
                  style={{
                    border: '1px solid var(--border-hairline)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.45rem 0.55rem',
                    background: 'rgba(14,17,22,0.55)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: items.length > 0 ? '0.3rem' : 0 }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: layerOn ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {layer.label} ({items.length})
                    </span>
                    <button
                      type="button"
                      className="kin-btn kin-btn-sm"
                      style={{ padding: '0.18rem 0.4rem' }}
                      onClick={() => toggleLayer(layer.id)}
                      aria-label={`Toggle ${layer.label} visibility`}
                      data-testid={`layer-toggle-${layer.id}`}
                    >
                      {layerOn ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  </div>
                  {items.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.18rem' }}>
                      {items.map((comp) => {
                        const active = selectedComponentId === comp.id;
                        return (
                          <button
                            key={comp.id}
                            type="button"
                            onClick={() => selectComponent(comp.id)}
                            style={{
                              textAlign: 'left',
                              background: active ? 'var(--accent-cyan-dim)' : 'transparent',
                              color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                              border: active ? '1px solid rgba(0,229,255,0.4)' : '1px solid transparent',
                              borderRadius: 4,
                              padding: '0.26rem 0.42rem',
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                            }}
                          >
                            {comp.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Center Stage: 3D Viewport + Camera Bar + Telemetry */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: 0 }}>
        <div style={{ position: 'relative', flex: 1, minHeight: 520 }}>
          <KineraViewport height="100%" />

          {/* Top-left Active Config & Telemetry HUD */}
          <div
            style={{
              position: 'absolute',
              top: '0.65rem',
              left: '0.65rem',
              display: 'flex',
              gap: '0.4rem',
              flexWrap: 'wrap',
              pointerEvents: 'none',
            }}
          >
            <span className="kin-badge kin-badge-cyan mono">{config.code} · {config.topology.placement}</span>
            <span className="kin-badge mono" data-testid="webgl-stats">
              {sceneStats.triangles.toLocaleString()} tris · {sceneStats.drawCalls} calls · {sceneStats.fps} FPS
            </span>
          </div>

          {/* Top-right Quality Tier */}
          <div style={{ position: 'absolute', top: '0.65rem', right: '0.65rem' }}>
            <select
              aria-label="3D quality tier"
              className="kin-select mono"
              value={qualityTier}
              onChange={(e) => setQualityTier(e.target.value as 'high' | 'medium' | 'low')}
              style={{ fontSize: '0.72rem', padding: '0.22rem 0.45rem' }}
            >
              <option value="high">Quality: High</option>
              <option value="medium">Quality: Medium</option>
              <option value="low">Quality: Low</option>
            </select>
          </div>
        </div>

        {/* Camera Presets Bar */}
        <div className="kin-panel" style={{ padding: '0.55rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.45rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {CAMERA_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`kin-btn kin-btn-sm ${cameraPreset === p.id ? 'kin-btn-primary' : ''}`}
                onClick={() => setCameraPreset(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              className="kin-btn kin-btn-sm"
              onClick={() => setCameraPreset('isometric-front')}
              data-testid="reset-camera-btn"
            >
              Reset Camera
            </button>
            <button
              type="button"
              className="kin-btn kin-btn-sm"
              onClick={resetAssembly}
              data-testid="reset-assembly-btn"
            >
              <RotateCcw size={13} />
              Reset Assembly
            </button>
          </div>
        </div>
      </section>

      {/* Right Rail: Spatial Inspection Tools + Component Metadata Inspector */}
      <aside className="kin-panel" style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 92px)' }}>
        <div className="kin-panel-header">
          <h2 className="kin-panel-title">Inspection & Metadata</h2>
          {selectedComp && (
            <button type="button" className="kin-btn kin-btn-sm" onClick={() => selectComponent(null)}>
              Clear
            </button>
          )}
        </div>

        <div className="kin-panel-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {/* Spatial Tools */}
          <div style={{ borderBottom: '1px solid var(--border-hairline)', paddingBottom: '0.75rem' }}>
            <div className="kin-slider-row">
              <div className="kin-slider-label">
                <span>Exploded View</span>
                <span className="mono">{Math.round(explodeFactor * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={explodeFactor}
                onChange={(e) => setExplodeFactor(Number(e.target.value))}
                className="kin-range"
                aria-label="Exploded view factor"
                data-testid="explode-slider"
              />
            </div>

            <div className="kin-slider-row">
              <div className="kin-slider-label">
                <span>Shell Transparency</span>
                <span className="mono">{Math.round(shellTransparency * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.9}
                step={0.02}
                value={shellTransparency}
                onChange={(e) => setShellTransparency(Number(e.target.value))}
                className="kin-range"
                aria-label="Shell transparency"
                data-testid="transparency-slider"
              />
            </div>

            {/* Section Cut */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <button
                type="button"
                className={`kin-btn kin-btn-sm ${sectionCutEnabled ? 'kin-btn-primary' : ''}`}
                onClick={() => setSectionCutEnabled(!sectionCutEnabled)}
                data-testid="section-cut-toggle"
              >
                <Scissors size={13} />
                Section Cut: {sectionCutEnabled ? 'ON' : 'OFF'}
              </button>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(['x', 'y', 'z'] as const).map((ax) => (
                  <button
                    key={ax}
                    type="button"
                    className={`kin-btn kin-btn-sm mono ${sectionCutAxis === ax ? 'kin-btn-primary' : ''}`}
                    onClick={() => setSectionCutAxis(ax)}
                  >
                    {ax.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {sectionCutEnabled && (
              <div className="kin-slider-row">
                <div className="kin-slider-label">
                  <span>Section Offset ({sectionCutAxis.toUpperCase()})</span>
                  <span className="mono">{sectionCutOffset.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min={-2.0}
                  max={2.0}
                  step={0.05}
                  value={sectionCutOffset}
                  onChange={(e) => setSectionCutOffset(Number(e.target.value))}
                  className="kin-range"
                  aria-label="Section cut offset"
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
              <button
                type="button"
                className={`kin-btn kin-btn-sm ${showPowerFlow ? 'kin-btn-primary' : ''}`}
                onClick={() => setShowPowerFlow(!showPowerFlow)}
              >
                <Sparkles size={13} />
                Power Flow
              </button>
              <button
                type="button"
                className={`kin-btn kin-btn-sm ${showRelationships ? 'kin-btn-primary' : ''}`}
                onClick={() => setShowRelationships(!showRelationships)}
              >
                <GitBranch size={13} />
                Relations
              </button>
              {selectedComp && (
                <button
                  type="button"
                  className={`kin-btn kin-btn-sm ${isolatedComponentId === selectedComp.id ? 'kin-btn-primary' : ''}`}
                  onClick={() =>
                    isolateComponent(isolatedComponentId === selectedComp.id ? null : selectedComp.id)
                  }
                  data-testid="isolate-component-btn"
                >
                  <Filter size={13} />
                  {isolatedComponentId === selectedComp.id ? 'Un-isolate' : 'Isolate'}
                </button>
              )}
              {isolatedComponentId && (
                <button
                  type="button"
                  className={`kin-btn kin-btn-sm ${soloIsolation ? 'kin-btn-primary' : ''}`}
                  onClick={() => setSoloIsolation(!soloIsolation)}
                >
                  {soloIsolation ? 'Solo' : 'Ghost'}
                </button>
              )}
            </div>
          </div>

          {/* Component Metadata Panel */}
          {selectedComp ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }} data-testid="component-inspector">
              <div>
                <span className="kin-badge kin-badge-cyan mono" style={{ marginBottom: '0.35rem' }}>
                  {selectedComp.id}
                </span>
                <h3 style={{ margin: '0.2rem 0', fontSize: '1.02rem' }}>{selectedComp.name}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedComp.category} · {selectedComp.subsystemId}
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {selectedComp.description}
              </p>

              <div style={{ background: 'rgba(14,17,22,0.65)', padding: '0.65rem', borderRadius: 6, border: '1px solid var(--border-hairline)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', marginBottom: '0.2rem' }}>
                  Engineering Function
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{selectedComp.primaryFunction}</div>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--accent-amber)', marginTop: '0.5rem', marginBottom: '0.2rem' }}>
                  Operating Principle
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedComp.operatingPrinciple}</div>
              </div>

              {Object.keys(selectedComp.technicalSpecifications).length > 0 && (
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 600, marginBottom: '0.3rem' }}>Specifications</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {Object.entries(selectedComp.technicalSpecifications).map(([k, val]) => (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.76rem',
                          borderBottom: '1px solid var(--border-hairline)',
                          paddingBottom: '0.18rem',
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                        <span className="mono">
                          {val && typeof val === 'object' ? `${val.value} ${val.unit}` : String(val ?? '—')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(upstreamRels.length > 0 || downstreamRels.length > 0) && (
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Upstream / Downstream Connections
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                    {upstreamRels.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className="kin-btn kin-btn-sm"
                        style={{ justifyContent: 'space-between', borderColor: 'rgba(59,130,246,0.4)' }}
                        onClick={() => selectComponent(r.sourceId)}
                      >
                        <span>← {COMPONENT_BY_ID[r.sourceId]?.name ?? r.sourceId}</span>
                        <span className="mono" style={{ fontSize: '0.68rem', color: '#93c5fd' }}>
                          {r.relationshipType}
                        </span>
                      </button>
                    ))}
                    {downstreamRels.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className="kin-btn kin-btn-sm"
                        style={{ justifyContent: 'space-between', borderColor: 'rgba(245,158,11,0.4)' }}
                        onClick={() => selectComponent(r.targetId)}
                      >
                        <span>→ {COMPONENT_BY_ID[r.targetId]?.name ?? r.targetId}</span>
                        <span className="mono" style={{ fontSize: '0.68rem', color: '#fcd34d' }}>
                          {r.relationshipType}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button type="button" className="kin-btn kin-btn-sm kin-btn-primary" onClick={() => navigate('/journey')}>
                  <Activity size={13} />
                  Powertrain Journey
                </button>
                <button type="button" className="kin-btn kin-btn-sm" onClick={() => setShowEqDrawer(true)}>
                  <BookOpen size={13} />
                  Equations
                </button>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              <Layers size={18} style={{ marginBottom: '0.35rem', color: 'var(--accent-cyan)' }} />
              <div>
                Click any 3D component in the viewport or select an item from the left Assembly Hierarchy to inspect its
                engineering specifications, inputs/outputs, and mechanical/electrical relationships.
              </div>
            </div>
          )}
        </div>
      </aside>

      {showEqDrawer && (
        <EquationDrawer
          equationIds={
            config.powertrainType === 'ev'
              ? ['eq.ev.motor-envelope', 'eq.ev.electrical-power', 'eq.powertrain.tractive-force']
              : ['eq.powertrain.ice-torque-output', 'eq.powertrain.gearbox-torque', 'eq.powertrain.open-diff']
          }
          onClose={() => setShowEqDrawer(false)}
        />
      )}
    </div>
  );
}
