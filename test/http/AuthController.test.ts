import { SignUp } from '@src/application/usecase/account/SignUp';
import { AccountProfileRepositoryPostgres } from '@src/infra/repository/AccountProfileRepository';
import { AccountRepositoryPostgres } from '@src/infra/repository/AccountRepository';
import { Server } from '@src/Server';
import { DatabaseTestContainer } from '@test/DatabaseTestContainer';
import { MessagingTestContainer } from '@test/MessagingTestContainer';
import config from 'config';
import { StatusCodes } from 'http-status-codes';
import supertest from 'supertest';

describe('Auth Controller', () => {
  let server: Server;
  const account = { username: 'johndoe@test.com', password: 'secret' };

  beforeAll(async () => {
    const dbContainer = DatabaseTestContainer.getInstance();
    await dbContainer.start();

    const messagingContainer = MessagingTestContainer.getInstance();
    await messagingContainer.start();

    server = new Server(
      config.get('server.port'),
      dbContainer.getConnectionUri(),
      messagingContainer.getConnectionUri(),
    );
    await server.init();

    const accountRepository = new AccountRepositoryPostgres(server.getDatabaseConnection());
    const accountProfileRepository = new AccountProfileRepositoryPostgres(server.getDatabaseConnection());
    const signUp = new SignUp(accountRepository, accountProfileRepository, server.getMessaging());
    await signUp.execute(account);

    global.testRequest = supertest(server.getApp());
  });

  afterAll(async () => {
    await server.close();
  });

  it('should be able to sign in', async () => {
    const { status, body } = await global.testRequest
      .post('/auth/v1/authenticate')
      .set({ 'Content-Type': 'application/json' })
      .send(account);

    expect(status).toBe(StatusCodes.CREATED);
    expect(body.token).toBeDefined();
  });

  it('should return unauthorized when credentials are wrong', async () => {
    const { status, body } = await global.testRequest
      .post('/auth/v1/authenticate')
      .set({ 'Content-Type': 'application/json' })
      .send({
        username: 'johndoe@test.com',
        password: 'wrong-password',
      });

    expect(status).toBe(StatusCodes.UNAUTHORIZED);
    expect(body.message).toBe('Your credentials are incorrect');
  });

  it('should return unauthorized when username does not exist', async () => {
    const { status, body } = await global.testRequest
      .post('/auth/v1/authenticate')
      .set({ 'Content-Type': 'application/json' })
      .send({
        username: 'wrog-account@test.com',
        password: 'secret',
      });

    expect(status).toBe(StatusCodes.UNAUTHORIZED);
    expect(body.message).toBe('Your credentials are incorrect');
  });

  it('should be able to refresh the token', async () => {
    const { body: loginBody } = await global.testRequest
      .post('/auth/v1/authenticate')
      .set({ 'Content-Type': 'application/json' })
      .send(account);

    const { status, body } = await global.testRequest
      .post('/auth/v1/refresh')
      .set({ 'Content-Type': 'application/json' })
      .send({ token: loginBody.refreshToken });

    expect(status).toBe(StatusCodes.CREATED);
    expect(body.token).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });
});
