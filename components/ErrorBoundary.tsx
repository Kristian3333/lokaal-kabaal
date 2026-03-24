'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/** Generic error boundary with fallback UI for dynamic components */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          padding: '20px', background: 'var(--paper2, #f5f5f5)',
          border: '1px solid var(--line, #ddd)', borderRadius: '8px',
          textAlign: 'center', color: 'var(--muted, #888)',
          fontSize: '13px', fontFamily: 'var(--font-mono, monospace)',
        }}>
          Er ging iets mis bij het laden van dit onderdeel.
        </div>
      );
    }
    return this.props.children;
  }
}
