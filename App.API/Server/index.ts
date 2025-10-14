import 'reflect-metadata';
import compression from 'compression';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';
import { connectDB } from '../Server/Database';
import { errorHandler } from '../Middlewares/ErrorHandler';
import logger from '../Utils/Logger';
import { RegisterRoutes } from '../Routes/Generated/routes'; // Import the generated routes
// import { iocLoader } from '../Config/IocResolver';

// Initialize TypeDI container
// iocLoader();

// Instantiate express
const server: Application = express();

//@ts-expect-error - TypeScript compatibility issue with compression types
server.use(compression());

// @ts-expect-error - TypeScript compatibility issue with passport types
server.use(passport.initialize());

// Connect to PostgreSQL database (exported promise lets the entrypoint await readiness before serving traffic)
export const dbReady = process.env.NODE_ENV !== 'test' ? connectDB() : Promise.resolve();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000', 'http://localhost:4000'];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};
server.use(cors(corsOptions));
server.use(express.json());

// Setup Swagger UI with dynamic loading
//@ts-expect-error - TypeScript compatibility issue with swaggerUi types
server.use('/api/docs', ...swaggerUi.serve);

server.get('/api/docs', (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to load the latest OpenAPI specification
    const swaggerDocument = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../swagger.json'), 'utf8'),
    );

    const setupHandler = swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'GoGoTime API Documentation',
    });

    // Call setupHandler without forcing type assertions; suppress incompat warning if needed
    // @ts-expect-error: mismatched types between express and swaggerUi types
    setupHandler(req, res, next);
  } catch {
    // If swagger.json doesn't exist, show a helpful message
    res.status(503).json({
      message: 'API documentation is being generated. Please try again in a moment.',
      suggestion: 'Visit /api/system/generate-openapi to trigger manual generation',
      error: 'swagger.json not found',
    });
  }
});

// Mount all API routes under /api prefix
const apiApp = express();
server.use('/api', apiApp);

RegisterRoutes(apiApp); // Register tsoa-generated routes with apiApp
console.log('✅ Routes registered');

server.use(errorHandler(logger));

export default server;
