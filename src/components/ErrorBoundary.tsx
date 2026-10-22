import { Component, type ErrorInfo, type ReactNode } from 'react';
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean; error: Error | null }> {
  state: { failed: boolean; error: Error | null } = { failed: false, error: null };
  static getDerivedStateFromError(error: Error) { return { failed: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled component error:', error, info);
  }
  render() {
    return this.state.failed ? (
      <div className="page">
        <span className="eyebrow">A TEMPORARY DETOUR</span>
        <h1>Let’s get back on course.</h1>
        <p>This page could not load correctly. Please reload and try again.</p>
        {this.state.error && (
          <p style={{ fontSize: '11px', color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '10px 14px', borderRadius: '6px', maxWidth: '600px' }}>
            {this.state.error.message}
          </p>
        )}
        <button className="button" onClick={() => window.location.reload()}>Reload website</button>
      </div>
    ) : this.props.children;
  }
}
