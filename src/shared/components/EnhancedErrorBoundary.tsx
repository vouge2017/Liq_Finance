import React, { Component, ReactNode } from 'react';
import { Icons } from './Icons';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    level?: 'page' | 'component' | 'form';
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    errorId: string;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
            errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log the error to console and optionally to an error reporting service
        console.error('Error Boundary caught an error:', error, errorInfo);

        this.setState({
            errorInfo,
        });

        // Call optional error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // In production, you would send this to your error reporting service
        this.logErrorToService(error, errorInfo);
    }

    private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
        // In a real application, you would send this to a service like Sentry, LogRocket, etc.
        const errorReport = {
            errorId: this.state.errorId,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            level: this.props.level || 'component',
        };

        // For now, just log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.group('🚨 Error Report');
            console.error('Error ID:', errorReport.errorId);
            console.error('Message:', errorReport.message);
            console.error('Stack:', errorReport.stack);
            console.error('Component Stack:', errorReport.componentStack);
            console.groupEnd();
        }

        // In production, you would send this to your error reporting service
        // fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorReport),
        // }).catch(err => console.error('Failed to send error report:', err));
    }

    private handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
        });
    };

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI based on level
            return this.renderErrorUI();
        }

        return this.props.children;
    }

    private renderErrorUI() {
        const { level = 'component' } = this.props;
        const { error, errorId } = this.state;

        const getErrorConfig = () => {
            switch (level) {
                case 'page':
                    return {
                        title: 'Something went wrong',
                        description: 'We encountered an unexpected error while loading this page.',
                        icon: Icons.Alert,
                        actions: [
                            { label: 'Try Again', onClick: this.handleRetry, primary: true },
                            { label: 'Go Home', onClick: this.handleGoHome, primary: false },
                        ],
                    };
                case 'form':
                    return {
                        title: 'Form Error',
                        description: 'There was a problem with this form. Please try again.',
                        icon: Icons.Error,
                        actions: [
                            { label: 'Retry', onClick: this.handleRetry, primary: true },
                        ],
                    };
                default:
                    return {
                        title: 'Component Error',
                        description: 'This component encountered an error. It has been automatically recovered.',
                        icon: Icons.Error,
                        actions: [
                            { label: 'Retry', onClick: this.handleRetry, primary: true },
                        ],
                    };
            }
        };

        const config = getErrorConfig();
        const Icon = config.icon;

        return (
            <div className="min-h-[400px] flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center space-y-6">
                    {/* Error Icon */}
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <Icon size={32} className="text-red-500" />
                    </div>

                    {/* Error Content */}
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {config.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {config.description}
                        </p>

                        {/* Show error details in development */}
                        {process.env.NODE_ENV === 'development' && error && (
                            <details className="text-left bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-xs">
                                <summary className="cursor-pointer text-gray-700 dark:text-gray-300 font-medium">
                                    Error Details (Development)
                                </summary>
                                <div className="mt-2 space-y-2">
                                    <div>
                                        <strong>Error ID:</strong> {errorId}
                                    </div>
                                    <div>
                                        <strong>Message:</strong> {error.message}
                                    </div>
                                    {error.stack && (
                                        <div>
                                            <strong>Stack:</strong>
                                            <pre className="whitespace-pre-wrap mt-1 text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded">
                                                {error.stack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {config.actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className={`px-6 py-3 rounded-xl font-medium transition-all ${action.primary
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
                                    }`}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>

                    {/* Additional Help */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p>
                            If this problem persists, please contact support with error ID:{' '}
                            <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                                {errorId}
                            </code>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

// ============================================================================
// HOOK FOR ERROR BOUNDARIES
// ============================================================================

// Removed react-error-boundary dependency for simplicity

export function useErrorNotification() {
    return {
        notifyError: (error: Error, context?: string) => {
            console.error(`Error in ${context || 'application'}:`, error);
            // In production, send to error reporting service
        },
        notifyUser: (message: string, type: 'error' | 'warning' | 'info' = 'error') => {
            // This would integrate with your notification system
            if (type === 'error') console.error(`User notification: ${message}`);
            else if (type === 'warning') console.warn(`User notification: ${message}`);
            else console.info(`User notification: ${message}`);
        },
    };
}

// ============================================================================
// ERROR COMPONENT FOR FORMS
// ============================================================================

interface FormErrorProps {
    error: string;
    field?: string;
    className?: string;
}

export function FormError({ error, field, className = '' }: FormErrorProps) {
    if (!error) return null;

    return (
        <div className={`text-red-500 text-xs mt-1 flex items-center gap-1 ${className}`}>
            <Icons.Error size={12} />
            <span>{error}</span>
        </div>
    );
}

// ============================================================================
// ERROR COMPONENT FOR GENERAL ERRORS
// ============================================================================

interface ErrorMessageProps {
    title?: string;
    message: string;
    type?: 'error' | 'warning' | 'info';
    onDismiss?: () => void;
    className?: string;
}

export function ErrorMessage({
    title,
    message,
    type = 'error',
    onDismiss,
    className = ''
}: ErrorMessageProps) {
    const getTypeStyles = () => {
        switch (type) {
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
            default:
                return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'warning':
                return Icons.Alert;
            case 'info':
                return Icons.Info;
            default:
                return Icons.Error;
        }
    };

    const Icon = getIcon();

    return (
        <div className={`border rounded-lg p-4 ${getTypeStyles()} ${className}`}>
            <div className="flex items-start gap-3">
                <Icon size={16} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    {title && (
                        <h4 className="font-medium mb-1">{title}</h4>
                    )}
                    <p className="text-sm">{message}</p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-current hover:opacity-70 transition-opacity"
                    >
                        <Icons.Close size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}