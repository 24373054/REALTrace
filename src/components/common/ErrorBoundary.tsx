import React from 'react';

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ChainTrace] Render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const isZh = document.documentElement.lang !== 'en';
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 32,
          background: 'var(--color-bg)', color: 'var(--color-text)',
          fontFamily: 'Inter, sans-serif',
        }}>
          <div style={{ fontSize: 40, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>⚠</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {isZh ? '页面渲染出错' : 'Render Error'}
          </div>
          <div style={{
            fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)',
            maxWidth: 560, textAlign: 'center', lineHeight: 1.6,
            padding: '12px 16px', background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}>
            {this.state.error?.message || 'Unknown error'}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              {isZh ? '刷新页面' : 'Refresh'}
            </button>
            <button className="btn" onClick={() => { this.setState({ hasError: false }); window.history.back(); }}>
              {isZh ? '返回上页' : 'Go Back'}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
