import { Server } from '@src/Server';
import config from 'config';

enum ExitStatus {
  FAILURE = 1,
  SUCCESS = 0,
}

process.on('unhandledRejection', (reason, promise) => {
  console.error(`App exiting due to an unhandled promise: ${promise} and reason: ${reason}`);
  throw reason;
});

process.on('uncaughtException', (reason, promise) => {
  console.error(`App exiting due to an uncaught exception: ${promise} and reason: ${reason}`);
  process.exit(ExitStatus.FAILURE);
});

(async (): Promise<void> => {
  try {
    const port = config.get<number>('server.port');
    const dbConnectionUri = `postgresql://${config.get('db.user')}:${config.get('db.password')}@${config.get('db.host')}:${config.get('db.port')}/${config.get('db.database')}`;

    const server = new Server(port, dbConnectionUri);
    server.init();
    server.start();

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

    exitSignals.map(signal =>
      process.on(signal, async () => {
        try {
          await server.close();
          console.info('App exited with success');
          process.exit(ExitStatus.SUCCESS);
        } catch (error) {
          console.error(`App exited with error: ${error}`);
          process.exit(ExitStatus.FAILURE);
        }
      }),
    );
  } catch (error) {
    console.error(`App exited with error: ${error}`);
    process.exit(ExitStatus.FAILURE);
  }
})();
