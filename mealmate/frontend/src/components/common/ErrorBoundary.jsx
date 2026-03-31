import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('MealMate Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexDirection: 'column', gap: 16,
          padding: '40px 20px', textAlign: 'center'
        }}>
          <span style={{ fontSize: 60 }}>🍳</span>
          <h2 style={{ fontSize: 22 }}>Something went wrong in the kitchen!</h2>
          <p style={{ color: 'var(--gray-500)', maxWidth: 340, fontSize: 14, lineHeight: 1.6 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
            <Link to="/" className="btn btn-primary" onClick={() => this.setState({ hasError: false, error: null })}>
              Go Home
            </Link>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{
              marginTop: 20, padding: 16, background: '#fff0f0', borderRadius: 8,
              fontSize: 11, textAlign: 'left', maxWidth: 600, overflow: 'auto',
              color: '#c0392b', border: '1px solid #ffc0c0'
            }}>
              {this.state.error?.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
