import config from 'config';
import logger from './infra/logging/logger';
import './module-alias';
import { Server } from './Server';

enum ExitStatus {
  FAILURE = 1,
  SUCCESS = 0,
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`App exiting due to an unhandled promise: ${promise} and reason: ${reason}`);
  throw reason;
});

process.on('uncaughtException', (reason, promise) => {
  logger.error(`App exiting due to an uncaught exception: ${promise} and reason: ${reason}`);
  process.exit(ExitStatus.FAILURE);
});

(async (): Promise<void> => {
  try {
    const port = config.get<number>('server.port');
    const dbConnectionUri = `postgresql://${config.get('db.user')}:${config.get('db.password')}@${config.get('db.host')}:${config.get('db.port')}/${config.get('db.database')}`;
    const messagingConnectionUri = `amqp://${config.get('messaging.user')}:${config.get('messaging.password')}@${config.get('messaging.host')}:${config.get('messaging.port')}`;

    const server = new Server(port, dbConnectionUri, messagingConnectionUri);
    await server.init();
    server.start();

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

    exitSignals.map(signal =>
      process.on(signal, async () => {
        try {
          await server.close();
          logger.info('App exited with success');
          process.exit(ExitStatus.SUCCESS);
        } catch (error) {
          logger.error(`App exited with error: ${error}`);
          process.exit(ExitStatus.FAILURE);
        }
      }),
    );
  } catch (error) {
    logger.error(`App exited with error: ${error}`);
    process.exit(ExitStatus.FAILURE);
  }
})();
