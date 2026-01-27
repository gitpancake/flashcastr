"use client";

import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-4 bg-gray-900 border border-red-500">
          <div className="text-center">
            <h2 className="text-red-400 font-invader text-lg mb-2">
              {'>>> SYSTEM ERROR <<<'}
            </h2>
            <p className="text-gray-400 font-mono text-sm mb-4">
              Something went wrong. Please refresh to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-transparent border border-red-400 text-red-400 font-invader text-xs hover:bg-red-400 hover:text-black transition-colors"
            >
              RESTART
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}