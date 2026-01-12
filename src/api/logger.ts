/**
 * Logger Service
 * Structured logging with environment awareness
 */

import { isDevelopment, isProduction } from './config'

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: Record<string, unknown>
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isDev = isDevelopment

  private formatEntry(entry: LogEntry): string {
    const { timestamp, level, message, data, error } = entry
    const parts = [`[${timestamp}]`, `[${level}]`, message]

    if (data && Object.keys(data).length > 0) {
      parts.push(JSON.stringify(data))
    }

    if (error) {
      parts.push(`Error: ${error.name} - ${error.message}`)
      if (this.isDev && error.stack) {
        parts.push(error.stack)
      }
    }

    return parts.join(' ')
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    }

    const formatted = this.formatEntry(entry)

    // Console output based on level
    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDev) console.debug(formatted)
        break
      case LogLevel.INFO:
        console.info(formatted)
        break
      case LogLevel.WARN:
        console.warn(formatted)
        break
      case LogLevel.ERROR:
        console.error(formatted)
        break
    }

    // In production, would send to error tracking service (Sentry, etc.)
    if (isProduction && level === LogLevel.ERROR) {
      // TODO: Send to Sentry or similar
    }

    return entry
  }

  debug(message: string, data?: Record<string, unknown>) {
    return this.log(LogLevel.DEBUG, message, data)
  }

  info(message: string, data?: Record<string, unknown>) {
    return this.log(LogLevel.INFO, message, data)
  }

  warn(message: string, data?: Record<string, unknown>) {
    return this.log(LogLevel.WARN, message, data)
  }

  error(message: string, error?: Error, data?: Record<string, unknown>) {
    return this.log(LogLevel.ERROR, message, data, error)
  }
}

export const logger = new Logger()
