
import compression from 'compression';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';

import initPassport from '../config/passport';
import { RegisterRoutes } from '../routes/generated/routes';
import { connectDB } from './database';

// Instantiate express
const server: Application = express();

server.use(compression());

// Passport Config
initPassport(passport);
server.use(passport.initialize());

// Connect to PostgreSQL database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

server.use(cors());
server.use(express.json());

// Setup Swagger UI with dynamic loading
//@ts-expect-error - TypeScript compatibility issue with swaggerUi types
server.use('/api/docs', ...swaggerUi.serve);
server.get('/api/docs', (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to load the latest OpenAPI specification
    const swaggerDocument = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../swagger.json'), 'utf8')
    );
    
    const setupHandler = swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'GoGoTime API Documentation'
    });
    
    setupHandler(req as any, res as any, next);
  } catch (error) {
    // If swagger.json doesn't exist, show a helpful message
    res.status(503).json({
      message: 'API documentation is being generated. Please try again in a moment.',
      suggestion: 'Visit /api/system/generate-openapi to trigger manual generation',
      error: 'swagger.json not found'
    });
  }
});

// Mount all API routes under /api prefix
const apiApp = express();
RegisterRoutes(apiApp);
server.use('/api', apiApp);

export default server;
