import logger from '@src/infra/logging/logger';
import crypto from 'crypto';
import { Response } from 'express';
import { LoggerOptions } from 'pino';
import pinoHttp from 'pino-http';

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

  customProps: (req: any) => {
    return {
      accountId: req.accountId,
    };
  },
});
