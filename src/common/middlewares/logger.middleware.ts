import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from '../services/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const start = Date.now();

    // Log incoming request
    this.logger.log(
      `[REQUEST] ${method} ${originalUrl} | IP: ${ip} | UA: ${userAgent}`,
      'HTTP',
    );

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;
      const duration = Date.now() - start;

      this.logger.log(
        `[RESPONSE] ${method} ${originalUrl} ${statusCode} - ${contentLength}b - ${duration}ms | IP: ${ip} | UA: ${userAgent}`,
        'HTTP',
      );
    });

    next();
  }
}