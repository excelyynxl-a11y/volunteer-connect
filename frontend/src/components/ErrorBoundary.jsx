import React from "react";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled frontend error:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="application-error-state" role="alert">
        <h1>Something went wrong</h1>
        <p>We could not display this page. Please try reloading it.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </main>
    );
  }
}

export default ErrorBoundary;
