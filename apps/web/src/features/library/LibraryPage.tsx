import { ArrowRight, BookOpen, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMPONENT_BY_ID } from '../../data/components';
import { EQUATIONS } from '../../data/equations';
import { TECHNICAL_LIBRARY_MODULES } from '../../data/library';
import { REFERENCES } from '../../data/references';
import { KatexMath } from '../../shared/KatexMath';
import { useKineraStore } from '../../store/useKineraStore';

export function LibraryPage() {
  const navigate = useNavigate();
  const setActiveConfigId = useKineraStore((s) => s.setActiveConfigId);
  const selectComponent = useKineraStore((s) => s.selectComponent);

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(TECHNICAL_LIBRARY_MODULES[0].id);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TECHNICAL_LIBRARY_MODULES.filter(
      (m) =>
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q) ||
        m.overview.scope.toLowerCase().includes(q),
    );
  }, [search]);

  const mod =
    TECHNICAL_LIBRARY_MODULES.find((m) => m.id === selectedId) ??
    filtered[0] ??
    TECHNICAL_LIBRARY_MODULES[0];

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '1rem 1.25rem 2.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.9rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', margin: '0 0 0.2rem' }}>
            Technical Library
          </h1>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            10 structured automotive engineering modules built on the 9-part academic reference specification
          </div>
        </div>
        <div style={{ position: 'relative', minWidth: 260 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
          <input
            type="search"
            className="kin-input"
            placeholder="Search library modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '1.9rem' }}
            aria-label="Search technical library"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)', gap: '0.9rem' }}>
        {/* Module Navigation */}
        <aside className="kin-panel" style={{ padding: '0.65rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.38rem' }} data-testid="library-module-list">
            {filtered.map((m) => {
              const active = m.id === mod.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedId(m.id)}
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
                  <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                    MODULE {m.number.toString().padStart(2, '0')}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.title}</div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* 9-Part Structured Module Reader */}
        <article className="kin-panel" style={{ padding: '1.3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }} data-testid="library-module-reader">
          <div>
            <span className="kin-badge kin-badge-cyan mono" style={{ marginBottom: '0.4rem' }}>
              MODULE {mod.number.toString().padStart(2, '0')} · {mod.id}
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', margin: '0.2rem 0' }}>{mod.title}</h2>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{mod.subtitle}</div>
          </div>

          {/* 1. Overview */}
          <section>
            <h3 className="kin-panel-title" style={{ marginBottom: '0.4rem' }}>1. Overview</h3>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', lineHeight: 1.55 }}>{mod.overview.scope}</p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {mod.overview.learningObjectives.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
          </section>

          {/* 2. Fundamentals */}
          <section>
            <h3 className="kin-panel-title" style={{ marginBottom: '0.4rem' }}>2. Fundamentals</h3>
            {mod.fundamentals.map((f, i) => (
              <p key={i} style={{ margin: '0 0 0.45rem', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {f}
              </p>
            ))}
          </section>

          {/* 3. Component Breakdown */}
          <section>
            <h3 className="kin-panel-title" style={{ marginBottom: '0.45rem' }}>3. Component Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.55rem' }}>
              {mod.componentIds.map((cid) => {
                const c = COMPONENT_BY_ID[cid];
                return (
                  <button
                    key={cid}
                    type="button"
                    className="kin-panel"
                    style={{ padding: '0.65rem', textAlign: 'left', cursor: 'pointer', background: '#0e1116' }}
                    onClick={() => {
                      if (c?.vehicleConfigurations[0]) setActiveConfigId(c.vehicleConfigurations[0]);
                      selectComponent(cid);
                      navigate('/anatomy');
                    }}
                  >
                    <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)' }}>{cid}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-primary)' }}>{c?.name ?? cid}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{c?.primaryFunction}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. Operating Principles */}
          <section>
            <h3 className="kin-panel-title" style={{ marginBottom: '0.4rem' }}>4. Operating Principles</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.87rem', lineHeight: 1.6 }}>
              {mod.operatingPrinciples.map((op, i) => (
                <li key={i}>{op}</li>
              ))}
            </ul>
          </section>

          {/* 5. Equations & Mathematical Models */}
          <section>
            <h3 className="kin-panel-title" style={{ marginBottom: '0.45rem' }}>5. Equations & Mathematical Models</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {mod.equationIds.map((eqId) => {
                const eq = EQUATIONS[eqId];
                if (!eq) return null;
                return (
                  <div key={eq.id} style={{ border: '1px solid var(--border-hairline)', borderRadius: 6, padding: '0.75rem', background: '#0e1116' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <strong>{eq.name}</strong>
                      <span className="kin-badge mono">{eq.modelClass}</span>
                    </div>
                    <div style={{ margin: '0.4rem 0', overflowX: 'auto' }}>
                      <KatexMath latex={eq.latex} displayMode />
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {eq.assumptions} ({eq.validityLimits})
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 6. Engineering Applications */}
          <section>
            <h3 className="kin-panel-title" style={{ marginBottom: '0.4rem' }}>6. Engineering Applications</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.87rem', color: 'var(--text-secondary)' }}>
              {mod.engineeringApplications.map((app, i) => (
                <li key={i}>{app}</li>
              ))}
            </ul>
          </section>

          {/* 7. Related Simulations */}
          <section>
            <h3 className="kin-panel-title" style={{ marginBottom: '0.45rem' }}>7. Related Simulations</h3>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {mod.relatedSimulations.map((sim, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="kin-btn kin-btn-primary"
                  onClick={() => {
                    setActiveConfigId(sim.configId);
                    navigate(sim.route);
                  }}
                >
                  <BookOpen size={14} />
                  {sim.title}
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          </section>

          {/* 8. Glossary */}
          <section>
            <h3 className="kin-panel-title" style={{ marginBottom: '0.4rem' }}>8. Glossary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
              {mod.glossaryTerms.map((g) => (
                <div key={g.term} style={{ background: '#0e1116', padding: '0.55rem 0.7rem', borderRadius: 6, border: '1px solid var(--border-hairline)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                    {g.term} {g.unit ? <span className="mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.74rem' }}>[{g.unit}]</span> : null}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{g.definition}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 9. References */}
          <section style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: '0.75rem' }}>
            <h3 className="kin-panel-title" style={{ marginBottom: '0.35rem' }}>9. Verified References</h3>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {mod.referenceIds.map((rid) => {
                const r = REFERENCES[rid];
                return r ? (
                  <div key={rid}>
                    <span className="mono">[{r.verificationStatus}]</span> {r.citation}
                  </div>
                ) : null;
              })}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
