import React from 'react';

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 32, background: 'var(--color-bg)', color: 'var(--color-text)' }}>
          <div style={{ fontSize: 48, color: 'var(--color-accent)' }}>⚠</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>页面渲染出错</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', maxWidth: 600, textAlign: 'center' }}>
            {this.state.error?.message}
          </div>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>刷新页面</button>
        </div>
      );
    }
    return this.props.children;
  }
}
