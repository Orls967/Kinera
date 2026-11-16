import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  scopeName?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Unexpected rendering error' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[KINERA ErrorBoundary:${this.props.scopeName ?? 'App'}]`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="kin-panel"
          style={{
            margin: '1.5rem auto',
            maxWidth: 640,
            padding: '1.5rem',
            borderColor: 'rgba(239,68,68,0.45)',
          }}
          role="alert"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fca5a5' }}>
            <AlertTriangle size={20} />
            <h3 style={{ margin: 0 }}>{this.props.scopeName ?? 'Workspace'} Recovery</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.75rem' }}>
            {this.state.message}
          </p>
          <button
            type="button"
            className="kin-btn kin-btn-primary"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            <RotateCcw size={15} />
            Reset {this.props.scopeName ?? 'View'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
