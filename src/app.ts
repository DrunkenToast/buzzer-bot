import dotenv from 'dotenv';
import winston from 'winston';
import { Logger } from './util/logger';
import { LoggingWinston } from '@google-cloud/logging-winston';
import { buildClient } from './discord';

if (process.env.NODE_ENV == null || process.env.NODE_ENV === 'develepmont') {
  dotenv.config();
  Logger.add(new winston.transports.Console({ format: winston.format.simple(), level: 'verbose' }));
} else {
  Logger.add(new LoggingWinston({ projectId: process.env.PROJECT_ID, logName: 'discord-canvas', prefix: 's0' }));
  Logger.exceptions.handle(new LoggingWinston({ projectId: process.env.PROJECT_ID, logName: 'discord-canvas', prefix: 's0' }));
}

buildClient();
