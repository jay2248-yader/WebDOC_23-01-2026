import { Component } from "react";
import PageErrorFallback from "./PageErrorFallback";

/**
 * ErrorBoundary — catches any render/lifecycle error in its subtree.
 * Prevents a single page crash from taking down the entire app.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomePage />
 *   </ErrorBoundary>
 *
 * Optional custom fallback:
 *   <ErrorBoundary fallback={(props) => <MyFallback {...props} />}>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} reset={this.reset} />;
      }
      return <PageErrorFallback error={this.state.error} reset={this.reset} />;
    }
    return this.props.children;
  }
}
