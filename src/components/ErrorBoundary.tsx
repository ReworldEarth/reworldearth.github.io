import * as React from "react";

export default class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
}> {
  state: { hasError: boolean };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error(error, info);
    console.error(error.stack);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <>Something went wrong.</>;
    }

    return this.props.children;
  }
}
