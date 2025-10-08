
import compression from 'compression';
import cors from 'cors';
import express, { Application } from 'express';
import passport from 'passport';

import initPassport from '../config/passport';
import routes from '../routes/users';
import { connectDB } from './database';

// Instantiate express
const server: Application = express();
server.use(compression());

// Passport Config
initPassport(passport);
// @ts-expect-error - TypeScript compatibility issue with passport types
server.use(passport.initialize());

// Connect to PostgreSQL database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

server.use(cors());
server.use(express.json());

// Initialize routes middleware
server.use('/api/users', routes);

export default server;
