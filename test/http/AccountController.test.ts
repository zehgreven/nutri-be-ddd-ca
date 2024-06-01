import { GetAccountByIdQuery } from '@src/application/query/GetAccountByIdQuery';
import { Server } from '@src/Server';
import { DatabaseTestContainer } from '@test/helpers/DatabaseTestContainer';
import config from 'config';
import { StatusCodes } from 'http-status-codes';
import supertest from 'supertest';

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
    it('should be able to create a client account', async () => {
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
      expect(accountById.profiles.length).toBe(1);
      expect(accountById.profiles[0].name).toBe('Cliente');
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

    it('ChangePassword: should be able to change password', async () => {
      const { status, body } = await global.testRequest
        .patch('/accounts/v1/password')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          oldPassword: 'secret',
          newPassword: 'new-secret',
        });

      expect(status).toBe(StatusCodes.OK);
      expect(body.username).toBe(account.username);
    });

    it('AssignProfile + UnassignProfile: should be able to assign and unassign profile', async () => {
      const { body: account } = await global.testRequest
        .post('/accounts/v1')
        .set({ 'Content-Type': 'application/json' })
        .send({
          username: `john.doe+${Math.random()}@test.com`,
          password: 'secret',
        });

      const createProfilePayload = {
        name: Math.random().toString(),
        description: Math.random().toString(),
      };
      const { body: profile } = await global.testRequest
        .post('/profiles/v1')
        .set({ 'Content-Type': 'application/json' })
        .set({ Authorization: `Bearer ${token}` })
        .send(createProfilePayload);

      const { status: assignProfileStatus } = await global.testRequest
        .post(`/accounts/v1/${account.id}/profile/${profile.id}`)
        .set({ 'Content-Type': 'application/json' })
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(assignProfileStatus).toBe(StatusCodes.CREATED);

      const { body: accountWithAssignedProfile } = await global.testRequest
        .get(`/accounts/v1/${account.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(accountWithAssignedProfile.profiles.length).toBe(2);
      const [assignedProfile] = accountWithAssignedProfile.profiles.filter(
        (profile: any) => profile.name === createProfilePayload.name,
      );
      expect(assignedProfile.id).toBeDefined();
      expect(assignedProfile.description).toBe(createProfilePayload.description);
      expect(assignedProfile.active).toBeTruthy();

      const { status } = await global.testRequest
        .delete(`/accounts/v1/${account.id}/profile/${profile.id}`)
        .set({ 'Content-Type': 'application/json' })
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(status).toBe(StatusCodes.NO_CONTENT);

      const { body: accountWithoutAssignedProfile } = await global.testRequest
        .get(`/accounts/v1/${account.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(accountWithoutAssignedProfile.profiles.length).toBe(1);
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
