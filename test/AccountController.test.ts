import config from 'config';
import { StatusCodes } from 'http-status-codes';
import supertest from 'supertest';
import { Server } from '../src/Server';
import { DatabaseTestContainer } from './helpers/DatabaseTestContainer';
import DatabaseConnection from '../src/infra/database/DatabaseConnection';
import { GetAccountByIdQuery } from '../src/application/query/GetAccountByIdQuery';

describe('Account Controller', () => {
  let server: Server;

  beforeAll(async () => {
    const dbContainer = DatabaseTestContainer.getInstance();
    await dbContainer.start();

    server = new Server(config.get('server.port'), dbContainer.getConnectionUri());
    server.init();

    global.testRequest = supertest(server.getApp());
  });

  describe('Sign Up', () => {
    it('should be able to create an account', async () => {
      const account = { username: `john.doe+${Math.random()}@test.com`, password: 'secret' };

      const { status, body } = await global.testRequest
        .post('/accounts/v1')
        .set({ 'Content-Type': 'application/json' })
        .send(account);

      expect(status).toBe(StatusCodes.CREATED);
      expect(body.id).toBeDefined();

      const getAccountByIdQuery = new GetAccountByIdQuery(server.getDatabaseConnection());
      const accountById = await getAccountByIdQuery.execute(body.id);
      expect(accountById.username).toBe(account.username);
      expect(accountById.password).not.toBe(account.password);
    });
  });

  describe('Authorized', () => {
    const account = { username: `john.doe+${Math.random()}@test.com`, password: 'secret' };
    let accountId: string;
    let token: string;

    beforeAll(async () => {
      const { body: createdAccount } = await global.testRequest
        .post('/accounts/v1')
        .set({ 'Content-Type': 'application/json' })
        .send(account);
      accountId = createdAccount.id;

      const { body: auth } = await global.testRequest
        .post('/auth/v1/authenticate')
        .set({ 'Content-Type': 'application/json' })
        .send(account);
      token = auth.token;
    });

    it('GetById: should be able to get user by id', async () => {
      const { status, body } = await global.testRequest
        .get(`/accounts/v1/${accountId}`)
        .set({ Authorization: `Bearer ${token}` })
        .send();

      expect(status).toBe(StatusCodes.OK);
      expect(body.username).toBe(account.username);
    });

    it("GetById: should return error when user doesn't exists", async () => {
      const { status, body } = await global.testRequest
        .get('/accounts/v1/a3588f9e-9ea0-4bd0-bf0f-edb495b49eeb')
        .set({ Authorization: `Bearer ${token}` })
        .send();

      expect(status).toBe(StatusCodes.NOT_FOUND);
      expect(body.message).toBeDefined();
    });

    it('GetAuthorized: should be able to get current user', async () => {
      const { status, body } = await global.testRequest
        .get('/accounts/v1/me')
        .set({ Authorization: `Bearer ${token}` })
        .send();

      expect(status).toBe(StatusCodes.OK);
      expect(body.username).toBe(account.username);
    });
  });

  describe('Not Authorized', () => {
    it('GetAuthorized: should be unautorized when token is invalid', async () => {
      const { status } = await global.testRequest
        .get('/accounts/v1/me')
        .set({ Authorization: `Bearer invalid-token` })
        .send();

      expect(status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('GetAuthorized: should be unautorized when token is missing', async () => {
      const { status } = await global.testRequest.get('/accounts/v1/me').send();
      expect(status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('GetById: should be unautorized when token is invalid', async () => {
      const { status } = await global.testRequest
        .get('/accounts/v1/a3588f9e-9ea0-4bd0-bf0f-edb495b49eeb')
        .set({ Authorization: `Bearer invalid-token` })
        .send();

      expect(status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('GetById: should be unautorized when token is missing', async () => {
      const { status } = await global.testRequest.get('/accounts/v1/a3588f9e-9ea0-4bd0-bf0f-edb495b49eeb').send();
      expect(status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });
});
