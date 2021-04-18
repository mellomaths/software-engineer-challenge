import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  const l = new Logger('LoggerMiddleware');
  l.log(`Received request at ${req.method} ${req.url}.`);
  next();
}
