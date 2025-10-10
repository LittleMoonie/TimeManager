import { createLogger, format, transports } from 'winston';

const { combine, timestamp, json, errors } = format;

const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
  transports: [
    new transports.Console(),
  ],
});

export default logger;
