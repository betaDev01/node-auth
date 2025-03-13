// import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../configs/env.config.js';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { NextFunction, Request, Response } from 'express';

// @Middleware({ type: 'before' })
export class AuthorizationMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction) {
    const token = request.headers.authorization;
    if (!token) {
      response.status(401).json({ message: 'No token provided' });
    } else {
      jwt.verify(token, `${SECRET_KEY}`, (err, decoded) => {
        if (err) {
          response.status(401).send({ message: err.message });
        } else {
          console.log("🚀 ~ AuthorizationHandler ~ jwt.verify ~ decoded:", decoded)
          next();
        }
      });
    }
  }
}
