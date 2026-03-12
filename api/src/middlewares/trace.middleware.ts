// The traceStore is a variable using the singleton pattern here. Same store is
// used through the entire request without passing it manually through function
// params.

// Client can always see their traceId in the response and running the
// traceStore adds it to the context of all functions called during the request.

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

export const traceStore = new AsyncLocalStorage<{ traceId: string }>();

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const traceId = (req.headers['x-trace-id'] as string) ?? randomUUID();
    res.setHeader('x-trace-id', traceId);
    traceStore.run({ traceId }, next);
  }
}
