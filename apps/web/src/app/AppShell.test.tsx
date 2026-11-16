import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppShell } from './AppShell';
import { InsightsPage } from '../features/insights/InsightsPage';
import { LibraryPage } from '../features/library/LibraryPage';

describe('Application Shell & Learning Sections', () => {
  it('renders all 6 top-level navigation links and 7 configuration options', () => {
    render(
      <HashRouter>
        <AppShell>
          <div>Content</div>
        </AppShell>
      </HashRouter>,
    );
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Vehicle Anatomy')).toBeInTheDocument();
    expect(screen.getByText('Powertrain Journey')).toBeInTheDocument();
    expect(screen.getByText('Engineering Simulator')).toBeInTheDocument();
    expect(screen.getByText('Engineering Insights')).toBeInTheDocument();
    expect(screen.getByText('Technical Library')).toBeInTheDocument();
    const select = screen.getByTestId('global-config-selector') as HTMLSelectElement;
    expect(select.options).toHaveLength(7);
  });

  it('renders Engineering Insights topics with equations', () => {
    render(
      <HashRouter>
        <InsightsPage />
      </HashRouter>,
    );
    expect(screen.getByTestId('insights-topic-list').children.length).toBe(37);
    expect(screen.getByTestId('insight-detail')).toBeInTheDocument();
  });

  it('renders all 10 Technical Library modules and 9-part reader', () => {
    render(
      <HashRouter>
        <LibraryPage />
      </HashRouter>,
    );
    expect(screen.getByTestId('library-module-list').children.length).toBe(10);
    expect(screen.getByTestId('library-module-reader')).toHaveTextContent('9. Verified References');
  });
});
