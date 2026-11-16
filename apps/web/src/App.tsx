import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './app/AppShell';
import { VehicleAnatomyPage } from './features/anatomy/VehicleAnatomyPage';
import { InsightsPage } from './features/insights/InsightsPage';
import { PowertrainJourneyPage } from './features/journey/PowertrainJourneyPage';
import { LibraryPage } from './features/library/LibraryPage';
import { OverviewPage } from './features/overview/OverviewPage';
import { SimulatorPage } from './features/simulator/SimulatorPage';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { simulationClient } from './simulation/SimulationClient';
import { useKineraStore } from './store/useKineraStore';

export function App() {
  const setIsOnline = useKineraStore((s) => s.setIsOnline);
  const setSimResults = useKineraStore((s) => s.setSimResults);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    simulationClient
      .init()
      .then(() => {
        setSimResults({ wasmStatus: 'ready' });
      })
      .catch(() => {
        setSimResults({ wasmStatus: 'degraded' });
      });

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [setIsOnline, setSimResults]);

  return (
    <ErrorBoundary scopeName="KINERA Application">
      <HashRouter>
        <AppShell>
          <ErrorBoundary scopeName="Section Workspace">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/anatomy" element={<VehicleAnatomyPage />} />
              <Route path="/journey" element={<PowertrainJourneyPage />} />
              <Route path="/simulator/*" element={<SimulatorPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </AppShell>
      </HashRouter>
    </ErrorBoundary>
  );
}

export default App;
