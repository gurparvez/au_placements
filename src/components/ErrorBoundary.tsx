import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/* A failed lazy chunk (typically a redeploy while the user was mid-session)
   can only be fixed by reloading — retrying the render refetches nothing. */
const isChunkError = (e: Error | null) =>
  !!e && /dynamically imported module|ChunkLoadError|Loading chunk/i.test(`${e.name} ${e.message}`);

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const chunk = isChunkError(this.state.error);
      return (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '48px 24px', textAlign: 'center' }}>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-.02em', margin: 0 }}>
            {chunk ? 'A new version is available' : 'Something went wrong'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14.5, maxWidth: '44ch', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
            {chunk
              ? 'The site was updated while you were browsing. Reload to pick up the latest version.'
              : 'An unexpected error occurred. Try again, or reload the page if it keeps happening.'}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '11px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--primary)', color: 'var(--on-primary)', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', transition: 'background .18s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
            >
              Reload page
            </button>
            {!chunk && (
              <button
                onClick={this.handleReset}
                style={{ padding: '11px 18px', borderRadius: 'var(--r-ctl)', background: 'var(--surface)', color: 'var(--text)', fontWeight: 600, fontSize: 14, border: '1px solid var(--border-strong)', cursor: 'pointer', transition: 'background .18s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
              >
                Try again
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
