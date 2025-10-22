/**
 * Error boundary specifically for date/time formatting issues
 * Prevents the entire application from crashing due to date errors
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class DateErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Check if this is a date-related error
        const isDateError = error.message.includes('Invalid Date') || 
                           error.message.includes('date') || 
                           error.message.includes('time') ||
                           error.message.includes('toLocaleDateString') ||
                           error.message.includes('toLocaleTimeString');

        if (isDateError) {
            console.warn('Date formatting error caught by boundary:', error);
            return { hasError: true, error };
        }

        // Re-throw non-date errors
        throw error;
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('DateErrorBoundary caught an error:', error, errorInfo);
        
        // Log the error for debugging
        if (process.env.NODE_ENV === 'development') {
            console.group('Date Error Details');
            console.error('Error:', error);
            console.error('Error Info:', errorInfo);
            console.error('Component Stack:', errorInfo.componentStack);
            console.groupEnd();
        }
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI for date errors
            return this.props.fallback || (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Date Display Issue
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>There was an issue displaying date/time information. Please refresh the page or contact support if the problem persists.</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Higher-order component for wrapping components that display dates
 */
export function withDateErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WrappedComponent(props: P) {
        return (
            <DateErrorBoundary fallback={fallback}>
                <Component {...props} />
            </DateErrorBoundary>
        );
    };
}

