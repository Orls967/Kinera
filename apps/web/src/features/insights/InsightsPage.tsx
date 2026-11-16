import { ArrowRight, BookOpen, CheckCircle2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMPONENT_BY_ID } from '../../data/components';
import { EQUATIONS } from '../../data/equations';
import { ENGINEERING_INSIGHTS } from '../../data/insights';
import { REFERENCES } from '../../data/references';
import { KatexMath } from '../../shared/KatexMath';
import { useKineraStore } from '../../store/useKineraStore';
import type { InsightDomain } from '../../types/kinera';

const DOMAINS: { id: 'all' | InsightDomain; label: string }[] = [
  { id: 'all', label: 'All Topics (37)' },
  { id: 'powertrain-fundamentals', label: 'Powertrain Fundamentals (10)' },
  { id: 'vehicle-architecture', label: 'Vehicle Architecture (9)' },
  { id: 'vehicle-dynamics', label: 'Vehicle Dynamics (10)' },
  { id: 'ev-engineering', label: 'EV Engineering (8)' },
];

export function InsightsPage() {
  const navigate = useNavigate();
  const setActiveConfigId = useKineraStore((s) => s.setActiveConfigId);
  const selectComponent = useKineraStore((s) => s.selectComponent);

  const [domain, setDomain] = useState<'all' | InsightDomain>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>(ENGINEERING_INSIGHTS[0].id);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ENGINEERING_INSIGHTS.filter(
      (t) =>
        (domain === 'all' || t.group === domain) &&
        (!q || t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q)),
    );
  }, [domain, search]);

  const activeTopic =
    ENGINEERING_INSIGHTS.find((t) => t.id === selectedId) ?? filtered[0] ?? ENGINEERING_INSIGHTS[0];

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '1rem 1.25rem 2.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.9rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', margin: '0 0 0.2rem' }}>
            Engineering Insights
          </h1>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            37 structured automotive engineering concepts linked directly to 3D components and Rust/WASM simulations
          </div>
        </div>
        <div style={{ position: 'relative', minWidth: 260 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
          <input
            type="search"
            className="kin-input"
            placeholder="Search insights..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '1.9rem' }}
            aria-label="Search engineering insights"
          />
        </div>
      </div>

      {/* Domain Filter Pills */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
        {DOMAINS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`kin-btn kin-btn-sm ${domain === d.id ? 'kin-btn-primary' : ''}`}
            onClick={() => setDomain(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(290px, 370px) minmax(0, 1fr)', gap: '0.9rem' }}>
        {/* Topic List */}
        <aside className="kin-panel" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '0.6rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }} data-testid="insights-topic-list">
            {filtered.map((t) => {
              const active = t.id === activeTopic.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  style={{
                    textAlign: 'left',
                    padding: '0.6rem 0.7rem',
                    borderRadius: 6,
                    border: active ? '1px solid var(--accent-cyan)' : '1px solid var(--border-hairline)',
                    background: active ? 'var(--accent-cyan-dim)' : 'rgba(14,17,22,0.5)',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.84rem', marginBottom: '0.18rem' }}>{t.title}</div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{t.summary}</div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Active Topic Detail */}
        <article className="kin-panel" style={{ padding: '1.25rem 1.4rem' }} data-testid="insight-detail">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <span className="kin-badge kin-badge-cyan mono">{activeTopic.id}</span>
            <span className="kin-badge">{activeTopic.group}</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', margin: '0 0 0.45rem' }}>
            {activeTopic.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.55, margin: '0 0 1rem' }}>
            {activeTopic.summary}
          </p>

          {/* Learning Objectives */}
          <div style={{ background: 'rgba(14,17,22,0.65)', border: '1px solid var(--border-hairline)', borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.4rem' }}>
              Learning Objectives
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
              {activeTopic.learningObjectives.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
          </div>

          {/* Technical Explanation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
            {activeTopic.explanation.map((p, i) => (
              <p key={i} style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                {p}
              </p>
            ))}
          </div>

          {/* Equations */}
          {activeTopic.equationIds.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--metal-silver)', margin: '0 0 0.5rem' }}>
                Governing Equations & Assumptions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {activeTopic.equationIds.map((eqId) => {
                  const eq = EQUATIONS[eqId];
                  if (!eq) return null;
                  return (
                    <div key={eq.id} style={{ border: '1px solid var(--border-hairline)', borderRadius: 6, padding: '0.75rem', background: '#0e1116' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <strong style={{ fontSize: '0.85rem' }}>{eq.name}</strong>
                        <span className="kin-badge mono">{eq.modelClass}</span>
                      </div>
                      <div style={{ margin: '0.45rem 0', overflowX: 'auto' }}>
                        <KatexMath latex={eq.latex} displayMode />
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        <strong>Assumptions:</strong> {eq.assumptions} · <strong>Bounds:</strong> {eq.validityLimits}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Worked Example */}
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6ee7b7', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
              <CheckCircle2 size={15} />
              Worked Numerical Example
            </div>
            <div style={{ fontSize: '0.84rem', marginBottom: '0.25rem' }}>{activeTopic.workedExample.prompt}</div>
            <div className="mono" style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
              {activeTopic.workedExample.resultSummary}
            </div>
          </div>

          {/* Linked Components + Sim Deep Link */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-hairline)', paddingTop: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {activeTopic.componentIds.map((cid) => (
                <button
                  key={cid}
                  type="button"
                  className="kin-btn kin-btn-sm mono"
                  onClick={() => {
                    if (activeTopic.simLink.configId) setActiveConfigId(activeTopic.simLink.configId);
                    selectComponent(cid);
                    navigate('/anatomy');
                  }}
                >
                  {COMPONENT_BY_ID[cid]?.name ?? cid}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="kin-btn kin-btn-sm kin-btn-primary"
              onClick={() => {
                if (activeTopic.simLink.configId) setActiveConfigId(activeTopic.simLink.configId);
                navigate(activeTopic.simLink.route);
              }}
            >
              <BookOpen size={13} />
              {activeTopic.simLink.label}
              <ArrowRight size={13} />
            </button>
          </div>

          {/* References */}
          <div style={{ marginTop: '0.85rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {activeTopic.referenceIds.map((rid) => {
              const r = REFERENCES[rid];
              return r ? <div key={rid}>[{r.verificationStatus}] {r.citation}</div> : null;
            })}
          </div>
        </article>
      </div>
    </div>
  );
}
