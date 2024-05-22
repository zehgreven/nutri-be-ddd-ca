import config from 'config';
import supertest from 'supertest';
import { SignUp } from '../src/application/usecase/SignUp';
import { AccountRepositoryPostgres } from '../src/infra/repository/AccountRepository';
import { Server } from '../src/Server';
import { DatabaseTestContainer } from './helpers/DatabaseTestContainer';
import { StatusCodes } from 'http-status-codes';

describe('Auth Controller', () => {
  const account = { username: 'johndoe@test.com', password: 'secret' };

  beforeAll(async () => {
    const dbContainer = DatabaseTestContainer.getInstance();
    await dbContainer.start();

    const server = new Server(config.get('server.port'), dbContainer.getConnectionUri());
    server.init();

    const accountRepository = new AccountRepositoryPostgres(server.getDatabaseConnection());
    const signUp = new SignUp(accountRepository);
    await signUp.execute(account);

    global.testRequest = supertest(server.getApp());
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

});
