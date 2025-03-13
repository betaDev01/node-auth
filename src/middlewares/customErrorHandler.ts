import { NextFunction, Request, Response } from 'express';
import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';

@Middleware({ type: 'after' })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: Error, _req: Request, res: Response, _next: NextFunction) {
    console.info('CustomErrorHandler ~ error ~ error:', error);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
