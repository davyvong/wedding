import React, { Fragment, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return <Fragment>{this.props.children}</Fragment>;
    }
    if (this.props.fallback) {
      return this.props.fallback;
    }
    return <Fragment />;
  }
}

export default ErrorBoundary;
