import 'reflect-metadata';

import http from 'http';
import { Container } from 'typedi';

import server, { dbReady } from './Server/index';
import { SchedulingService } from './Services/SchedulingService';

const { PORT } = process.env;

const httpServer = http.createServer({}, server);

const startServer = async (): Promise<void> => {
  try {
    await dbReady;
    const scheduler = Container.get(SchedulingService);
    scheduler.start();

    httpServer.listen(PORT, () => {
      console.warn(`🚀 Server is listening on port ${PORT}`);
      console.warn(`📖 API Documentation available at: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error('❌ Failed to initialise database connection:', error);
    process.exit(1);
  }
};

void startServer();
