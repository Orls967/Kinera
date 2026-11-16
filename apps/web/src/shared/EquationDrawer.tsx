import { X } from 'lucide-react';
import { EQUATIONS } from '../data/equations';
import { REFERENCES } from '../data/references';
import { KatexMath } from './KatexMath';

interface EquationDrawerProps {
  equationIds: string[];
  onClose: () => void;
  title?: string;
}

export function EquationDrawer({ equationIds, onClose, title = 'Governing Engineering Equations' }: EquationDrawerProps) {
  const eqs = equationIds.map((id) => EQUATIONS[id]).filter(Boolean);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'rgba(6, 8, 12, 0.72)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="kin-panel"
        style={{
          width: 'min(520px, 96vw)',
          height: '100%',
          borderRadius: 0,
          overflowY: 'auto',
          background: '#11161f',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="kin-panel-header">
          <h3 className="kin-panel-title">{title}</h3>
          <button type="button" className="kin-btn kin-btn-sm" onClick={onClose} aria-label="Close equations">
            <X size={15} />
          </button>
        </div>
        <div className="kin-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {eqs.map((eq) => {
            const ref = REFERENCES[eq.referenceId];
            return (
              <div
                key={eq.id}
                style={{
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem',
                  background: 'rgba(14,17,22,0.75)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{eq.name}</strong>
                  <span className="kin-badge kin-badge-cyan mono">{eq.modelClass}</span>
                </div>
                <div style={{ margin: '0.7rem 0', overflowX: 'auto', padding: '0.4rem 0' }}>
                  <KatexMath latex={eq.latex} displayMode />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                  <strong>Assumptions:</strong> {eq.assumptions}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', marginBottom: '0.45rem' }}>
                  <strong>Validity Bounds:</strong> {eq.validityLimits}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {eq.variables.map((v) => (
                    <span key={v.symbol} className="kin-badge">
                      <KatexMath latex={v.symbol} /> : {v.meaning} [{v.unit}]
                    </span>
                  ))}
                </div>
                {ref && (
                  <div style={{ marginTop: '0.55rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Source ({ref.verificationStatus}): {ref.citation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
