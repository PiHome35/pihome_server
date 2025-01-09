import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log the incoming request
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Add event listener for when the response is finished
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const responseTime = Date.now() - startTime;

      // Color status code based on range
      const statusColor = this.getStatusColor(statusCode);

      this.logger.log(
        `${method} ${originalUrl} - ${statusColor}${statusCode}${'\x1b[0m'} - ${responseTime}ms - ${contentLength || 0}b - ${ip}`,
      );
    });

    next();
  }

  private getStatusColor(status: number): string {
    if (status >= 500) return '\x1b[31m'; // Red
    if (status >= 400) return '\x1b[33m'; // Yellow
    if (status >= 300) return '\x1b[36m'; // Cyan
    if (status >= 200) return '\x1b[32m'; // Green
    return '\x1b[0m'; // Default
  }
}
