import logger from '../../logging/logger';

const LoggerCorrelationIdMiddleware = async (req: any, _: any, next: Function): Promise<void> => {
  logger.setBindings({
    request: {
      id: req.correlationId,
      method: req.method,
      url: req.url,
    },
    accountId: req.accountId,
  });

  next();
};

export default LoggerCorrelationIdMiddleware;
