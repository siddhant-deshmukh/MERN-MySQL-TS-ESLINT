import cors from 'cors'; 
import morgan from 'morgan';
import helmet from 'helmet';
import mongoose from 'mongoose';
import logger from 'jet-logger';
import express, { Request, Response, NextFunction } from 'express';

import BaseRouter from '@src/routes';

import ENV from '@src/common/constants/ENV';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/util/route-errors';
import { NodeEnvs } from '@src/common/constants';
import { connectMySQL } from './models/mysqlSetup';


/******************************************************************************
                                Setup
******************************************************************************/

const app = express();


// **** Middleware **** //
const corsOptions = {
  origin: 'http://localhost:4200', // Allow only this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true // Allow cookies, authorization headers, etc.
};

app.use(cors(corsOptions));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// Show routes called in console during development
if (ENV.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// Security
if (ENV.NodeEnv === NodeEnvs.Production) {
  // eslint-disable-next-line n/no-process-env
  if (!process.env.DISABLE_HELMET) {
    app.use(helmet());
  }
}

// Database connections

mongoose.connect(ENV.MongodbConnectionString)
  .then(() => logger.info('MongoDB connected successfully!'))
  .catch((err: unknown) => {
    logger.err('MongoDB connection error:', true);
    logger.err(err, true);
  });

connectMySQL();

// Add APIs, must be after middleware
app.use('/', BaseRouter);

// Add error handler
app.use((err: Error, _: Request, res: Response, _next: NextFunction) => {
  if (ENV.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
    res.status(status).json({ msg: err.message });
    return;
  }
  res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Internal Server Error' });
});


/******************************************************************************
                                Export default
******************************************************************************/

export default app;
