import * as path from 'path';

import Controller from './interfaces/controller.interface';
import errorMiddleware from './middleware/error.middleware';

import mongoose = require('mongoose');
import express = require('express');
import cors = require('cors');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');

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
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
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

  private connectToTheDatabase() {
    const { MONGO_USER, MONGO_PWD, MONGO_PATH, MONGO_SSL_CA } = process.env;
    let url = `mongodb://${MONGO_USER}:${MONGO_PWD}@${MONGO_PATH}`;
    let options: mongoose.ConnectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    };
    let query: { [key: string]: string } = {};
    query['retryWrites'] = 'false';
    if (MONGO_SSL_CA != '') {
      const fs = require('fs');
      //Specify the Amazon DocumentDB cert
      var ca = [fs.readFileSync(MONGO_SSL_CA)];
      query['ssl'] = 'true';
      query['replicaSet'] = 'rs0';
      query['readPreference'] = 'secondaryPreferred';
      // url += '?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred';
      options = {
        ...options,
        sslValidate: true,
        sslCA: ca,
        useNewUrlParser: true,
      };
    }
    let queries = [];
    for (const key in query) {
      queries.push(`${key}=${query[key]}`);
    }
    let queryStr = queries.join('&');
    console.log('url: ', url);
    console.log('options: ', options);
    mongoose.connect(queryStr ? url + '?' + queryStr : url, options);
  }
}

export default App;
