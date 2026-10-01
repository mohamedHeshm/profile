import { Component, type ReactNode } from 'react'

export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="auth">
        <h1>Something went wrong</h1>
        <p className="muted">The page could not load. Check your connection and try again.</p>
        <button className="btn primary" onClick={() => window.location.reload()}>Reload</button>
      </main>
    )
  }
}
