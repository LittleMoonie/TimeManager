import 'reflect-metadata';
import { Server } from 'http';

import cors from 'cors';
import express, { Application } from 'express';
import { Container } from 'typedi';

import { errorHandler } from '../Middlewares/ErrorHandler';
import logger from '../Utils/Logger';

let RegisterRoutes: (app: express.Application) => void = () => {};

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  ({ RegisterRoutes } = require('../Routes/Generated/routes'));
} catch (err) {
  console.warn('⚠️ Skipping TSOA route registration in test mode:', (err as Error).message);
}

export const createTestApp = (mockSetup?: () => void): Application => {
  Container.reset();

  const app: Application = express();

  if (mockSetup) mockSetup();

  const corsOptions = {
    origin: '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  const apiApp = express();
  app.use('/api', apiApp);

  // ✅ This will now work even if tsoa routes aren’t compiled
  RegisterRoutes(apiApp);

  app.use(errorHandler(logger));

  return app;
};

export const startTestServer = async (app: Application, port = 0): Promise<Server> =>
  // eslint-disable-next-line promise/avoid-new
  new Promise((resolve) => {
    const server = app.listen(port, () => {
      const actualPort = (server.address() as any)?.port;

      console.warn(`🧪 Test server running on port ${actualPort}`);
      resolve(server);
    });
  });

export const closeTestServer = (server: Server): Promise<void> =>
  // eslint-disable-next-line promise/avoid-new
  new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
