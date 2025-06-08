import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class CustomLoggerService implements NestLoggerService {
  
  log(message: string, context?: string) {
    this.printMessage('LOG', message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.printMessage('ERROR', message, context);
    if (trace && process.env.NODE_ENV !== 'production') {
      console.error(trace);
    }
  }

  warn(message: string, context?: string) {
    this.printMessage('WARN', message, context);
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.printMessage('DEBUG', message, context);
    }
  }

  verbose(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.printMessage('VERBOSE', message, context);
    }
  }

  private printMessage(level: string, message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    const logMessage = `${timestamp} [${level}] ${contextStr} ${message}`;
    
    switch (level) {
      case 'ERROR':
        console.error(logMessage);
        break;
      case 'WARN':
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
        break;
    }
  }
}