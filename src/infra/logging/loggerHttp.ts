import crypto from 'crypto';
import { Response } from 'express';
import { LoggerOptions } from 'pino';
import pinoHttp from 'pino-http';
import logger from './logger';

export default pinoHttp<LoggerOptions>({
  logger,

  genReqId: (req: any, res: any) => {
    const correlationId = crypto.randomUUID();
    res.setHeader('correlationId', correlationId);
    req.correlationId = correlationId;
    return correlationId;
  },

  serializers: {
    err: (err: any) => ({
      message: err?.message,
    }),
    req: req => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res: Response) => ({
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
    }),
  },

  wrapSerializers: true,

  customLogLevel: (req: any, res: any, err: any) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }
    return 'info';
  },

  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'timeTaken',
  },

  redact: (req: any, res: any) => {
    return {
      'req.headers.authorization': true,
    };
  },

  customProps: (req: any, res: any) => {
    return {
      accountId: req.accountId,
      correlationId: req.id || '',
    };
  },
});
