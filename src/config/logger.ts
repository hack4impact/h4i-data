import winston from 'winston';
import path from 'path';
import { env } from './server';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = 'logs';

// Create custom format for better readability
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += '\n' + JSON.stringify(meta, null, 2);
    }

    return log;
  })
);

const isDevelopment = env.NODE_ENV === 'development';

// Create the logger
export const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: customFormat,
  defaultMeta: {
    service: 'operations-api',
    environment: env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format: isDevelopment ? consoleFormat : customFormat,
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
});

if (isDevelopment) {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
      tailable: true,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760,
      maxFiles: 5,
      tailable: true,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'requests.log'),
      level: 'http',
      maxsize: 10485760,
      maxFiles: 3,
      tailable: true,
    })
  );

  logger.exceptions.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
    })
  );

  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
    })
  );
}

// Add custom log levels
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  http: 'magenta',
  debug: 'white',
});

export default logger;
