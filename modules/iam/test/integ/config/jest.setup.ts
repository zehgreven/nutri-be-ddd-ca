import { Server } from '@src/Server';
import { DatabaseTestContainer } from '@test/integ/container/DatabaseTestContainer';
import { MessagingTestContainer } from '@test/integ/container/MessagingTestContainer';
import config from 'config';
import supertest from 'supertest';

let server: Server;
let databaseContainer: DatabaseTestContainer;
let messagingContainer: MessagingTestContainer;

beforeAll(async () => {
  databaseContainer = DatabaseTestContainer.getInstance();
  await databaseContainer.start();

  messagingContainer = MessagingTestContainer.getInstance();
  await messagingContainer.start();

  server = new Server(
    config.get('server.port'),
    databaseContainer.getConnectionUri(),
    messagingContainer.getConnectionUri(),
  );
  await server.init();
  global.testRequest = supertest(server.getApp());
  global.server = server;
});

afterAll(async () => {
  await server.close();
  await databaseContainer.stop();
  await messagingContainer.stop();
});
