import { NavLink } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Compass,
  Cpu,
  Gauge,
  Layers,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { VEHICLE_CONFIGURATIONS } from '../data/configs';
import { useKineraStore } from '../store/useKineraStore';
import type { ConfigId } from '../types/kinera';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: Compass, end: true },
  { to: '/anatomy', label: 'Vehicle Anatomy', icon: Layers, end: false },
  { to: '/journey', label: 'Powertrain Journey', icon: Activity, end: false },
  { to: '/simulator', label: 'Engineering Simulator', icon: Gauge, end: false },
  { to: '/insights', label: 'Engineering Insights', icon: Cpu, end: false },
  { to: '/library', label: 'Technical Library', icon: BookOpen, end: false },
];

export function AppShell({ children }: { children: ReactNode }) {
  const activeConfigId = useKineraStore((s) => s.activeConfigId);
  const setActiveConfigId = useKineraStore((s) => s.setActiveConfigId);
  const unitMode = useKineraStore((s) => s.unitMode);
  const setUnitMode = useKineraStore((s) => s.setUnitMode);
  const isOnline = useKineraStore((s) => s.isOnline);
  const swUpdateAvailable = useKineraStore((s) => s.swUpdateAvailable);

  return (
    <div className="kin-app-shell">
      <header className="kin-header">
        <div className="kin-header-inner">
          <NavLink to="/" className="kin-brand" style={{ textDecoration: 'none' }}>
            <div className="kin-brand-mark" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="3.5" stroke="#C8D0DC" strokeWidth="1.8" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#F59E0B" strokeWidth="1.8" />
              </svg>
            </div>
            <div>
              <span className="kin-brand-title">KINERA</span>
              <span className="kin-brand-sub">Explore the Mechanics. Understand the Motion.</span>
            </div>
          </NavLink>

          <nav className="kin-nav" aria-label="Primary sections">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `kin-nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="kin-header-tools">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Config</span>
              <select
                aria-label="Active vehicle configuration"
                className="kin-select mono"
                value={activeConfigId}
                onChange={(e) => setActiveConfigId(e.target.value as ConfigId)}
                data-testid="global-config-selector"
              >
                {VEHICLE_CONFIGURATIONS.map((cfg) => (
                  <option key={cfg.id} value={cfg.id}>
                    {cfg.code}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="kin-btn kin-btn-sm mono"
              onClick={() => setUnitMode(unitMode === 'si' ? 'engineering' : 'si')}
              title="Toggle between strict SI units and engineering display units"
              data-testid="unit-mode-toggle"
            >
              {unitMode === 'si' ? 'SI Strict' : 'km/h · kW'}
            </button>

            <span
              className={`kin-badge ${isOnline ? 'kin-badge-emerald' : 'kin-badge-amber'}`}
              title={isOnline ? 'Online — PWA assets cached' : 'Offline Mode — Running locally'}
            >
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? 'Ready' : 'Offline'}
            </span>

            {swUpdateAvailable && (
              <button
                type="button"
                className="kin-btn kin-btn-sm kin-btn-primary"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={13} />
                Update
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="kin-main">{children}</main>
    </div>
  );
}
