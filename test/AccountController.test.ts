import config from 'config';
import supertest from 'supertest';
import { SignUp } from '../src/application/usecase/SignUp';
import { AccountRepositoryPostgres } from '../src/infra/repository/AccountRepository';
import { Server } from '../src/Server';
import { DatabaseTestContainer } from './helpers/DatabaseTestContainer';

describe('Account Controller', () => {
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

  it('should be able to get current user', async () => {
    const { body: auth } = await global.testRequest
      .post('/auth/v1/authenticate')
      .set({ 'Content-Type': 'application/json' })
      .send(account);

    const { status, body } = await global.testRequest
      .get('/accounts/v1/me')
      .set({ Authorization: `Bearer ${auth.token}` })
      .send();

    expect(status).toBe(200);
    expect(body.username).toBe(account.username);
  });

  it('should be unautorized when token is invalid', async () => {
    const { status } = await global.testRequest
      .get('/accounts/v1/me')
      .set({ Authorization: `Bearer invalid-token` })
      .send();

    expect(status).toBe(401);
  });

  it('should be unautorized when token is missing', async () => {
    const { status } = await global.testRequest.get('/accounts/v1/me').send();
    expect(status).toBe(401);
  });
});
