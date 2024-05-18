import config from 'config';
import supertest from 'supertest';
import { SignUp } from '../src/application/usecase/SignUp';
import DatabaseConnection, { PgPromiseAdapter } from '../src/infra/database/DatabaseConnection';
import { AccountRepository, AccountRepositoryPostgres } from '../src/infra/repository/AccountRepository';
import { Server } from '../src/Server';
import { DatabaseTestContainer } from './helpers/DatabaseTestContainer';

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

    expect(status).toBe(200);
    expect(body.token).toBeDefined();
  });

  it('should throw an error when password is incorrect', async () => {
    const { status, body } = await global.testRequest
      .post('/auth/v1/authenticate')
      .set({ 'Content-Type': 'application/json' })
      .send({
        username: 'johndoe@test.com',
        password: 'wrong-password',
      });

    expect(status).toBe(401);
    expect(body.message).toBe('Your credentials are incorrect');
  });
});
