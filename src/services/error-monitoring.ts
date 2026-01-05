// Error Monitoring Service
// Lightweight error tracking for production

interface ErrorReport {
    id: string
    message: string
    stack?: string
    timestamp: string
    userAgent: string
    url: string
    userId?: string
    level: 'error' | 'warning' | 'info'
}

class ErrorMonitoringService {
    private endpoint: string | null = null
    private userId: string | null = null
    private isEnabled: boolean = process.env.NODE_ENV === 'production'

    constructor() {
        // In production, you would set this to your error tracking service
        // For now, we'll just log to console in development
        if (process.env.NODE_ENV === 'production') {
            this.endpoint = process.env.VITE_ERROR_ENDPOINT || null
        }
    }

    setUserId(userId: string) {
        this.userId = userId
    }

    reportError(error: Error, context?: any) {
        const report: ErrorReport = {
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.userId || undefined,
            level: 'error'
        }

        if (this.isEnabled && this.endpoint) {
            // Send to error tracking service
            fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(report)
            }).catch(console.error)
        } else {
            // Development logging
            console.group('🚨 Error Report')
            console.error('Error ID:', report.id)
            console.error('Message:', error.message)
            console.error('Stack:', error.stack)
            console.error('Context:', context)
            console.error('User Agent:', report.userAgent)
            console.error('URL:', report.url)
            console.groupEnd()
        }
    }

    reportWarning(message: string, context?: any) {
        const report: ErrorReport = {
            id: `warning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            message,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.userId || undefined,
            level: 'warning'
        }

        if (this.isEnabled && this.endpoint) {
            fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            }).catch(console.error)
        } else {
            console.warn('⚠️ Warning:', message, context)
        }
    }
}

export const errorMonitoring = new ErrorMonitoringService()

// Global error handler
window.addEventListener('error', (event) => {
    errorMonitoring.reportError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    })
})

window.addEventListener('unhandledrejection', (event) => {
    errorMonitoring.reportError(new Error(event.reason), {
        type: 'unhandledrejection'
    })
})