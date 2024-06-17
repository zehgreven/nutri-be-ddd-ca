import config from 'config';
import pino, { LoggerOptions } from 'pino';

const transport = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  ],
});

const loggerOptions: LoggerOptions = {
  enabled: config.get('logger.enabled'),
  level: config.get('logger.level'),
  formatters: {
    bindings: bindings => {
      return {
        host: bindings.host,
        request: bindings.request,
        accountId: bindings.accountId,
      };
    },
  },
  timestamp: () => {
    return `,"time":"${new Date(Date.now()).toLocaleTimeString([], {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}"`;
  },
};

export default pino(loggerOptions, transport);
