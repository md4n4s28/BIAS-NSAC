import { Component, type ErrorInfo, type ReactNode } from 'react';
export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() { return this.state.failed ? <div className="page"><span className="eyebrow">A TEMPORARY DETOUR</span><h1>Let’s get back on course.</h1><p>This page could not load correctly. Please reload and try again.</p><button className="button" onClick={() => window.location.reload()}>Reload website</button></div> : this.props.children; }
}
