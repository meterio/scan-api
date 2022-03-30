import * as path from 'path';

import { Network, connectDB } from '@meterio/scan-db/dist';

import Controller from './interfaces/controller.interface';
import errorMiddleware from './middleware/error.middleware';

import express = require('express');
import cors = require('cors');
import cookieParser = require('cookie-parser');

function loggerMiddleware(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) {
  console.log(`${request.method} ${request.path}`);
  next();
}

class App {
  public app: express.Application;

  constructor(controllers: Controller[]) {
    this.app = express();

    this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(process.env.PORT, () => {
      console.log(`App listening on the port ${process.env.PORT}`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.set('view engine', 'ejs');
    this.app.use(loggerMiddleware);
    this.app.use(cors());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }

  private async connectToTheDatabase() {
    const network =
      process.env.NETWORK === 'mainnet' ? Network.MainNet : Network.TestNet;
    await connectDB(network);
  }
}

export default App;
