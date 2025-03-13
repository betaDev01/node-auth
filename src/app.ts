import 'reflect-metadata';
import express from 'express';
import { useExpressServer } from 'routing-controllers';

import { SERVER_PORT } from './configs/env.config.js';
import { CustomErrorHandler } from './middlewares/customErrorHandler.js';
import { ServerController } from './controller/serverController.js';
import { AuthorizationMiddleware } from './middlewares/authenticationMiddleware.js';
import { AuthorizationController } from './controller/authorizationController.js';
import { rateLimit } from 'express-rate-limit'
import { AdminController, ServiceController } from './controller/serviceController.js';

export class App {
  public app: express.Application;
  public port: string | number;
  constructor() {
    this.port = SERVER_PORT || 4000;

    this.app = express();
    this.initializeMiddlewares();

    const limiter = rateLimit({
      windowMs: 5 * 60 * 1000,
      limit: 10
    });

    this.app.use(limiter);

    useExpressServer(this.app, {
      controllers: [ServerController, AuthorizationController, ServiceController, AdminController],
      cors: true,
      defaults: {
        nullResultCode: 404,
        undefinedResultCode: 204,
      }
    });

  }

  public listen() {
    this.app.listen(this.port, () => {
      console.info(`Server Running on port : ${this.port}`);
    });
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }
}
