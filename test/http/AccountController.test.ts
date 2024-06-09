import { GetAccountByIdQuery } from '@src/application/query/account/GetAccountByIdQuery';
import { Server } from '@src/Server';
import { DatabaseTestContainer } from '@test/DatabaseTestContainer';
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

    describe('AssignAccountPermission', () => {
      afterAll(async () => {
        const accountId = '13782202-684d-4ba9-9cad-487b9e4a6a8a';
        const functionalityId = '8c29a940-463c-4670-914a-ef57cfb8cb3e';
        await global.testRequest
          .delete(`/accounts/v1/${accountId}/functionality/${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();
      });
      it('AssignAccountPermission: should be able to assign permission to account', async () => {
        const accountId = '13782202-684d-4ba9-9cad-487b9e4a6a8a';
        const functionalityId = '8c29a940-463c-4670-914a-ef57cfb8cb3e';
        const { status } = await global.testRequest
          .post(`/accounts/v1/${accountId}/functionality/${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();
        expect(status).toBe(StatusCodes.CREATED);
      });

      it('AssignAccountPermission: should return error when account not found', async () => {
        const accountId = '87a5ce0d-3565-4d00-b474-c8dd0d1ccdf7';
        const functionalityId = '8c29a940-463c-4670-914a-ef57cfb8cb3e';

        await global.testRequest
          .post(`/accounts/v1/${accountId}/functionality/${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();

        const { status } = await global.testRequest
          .post(`/accounts/v1/${accountId}/functionality/${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();
        expect(status).toBe(StatusCodes.NOT_FOUND);
      });

      it('AssignAccountPermission: should return error when functionality not found', async () => {
        const accountId = '13782202-684d-4ba9-9cad-487b9e4a6a8a';
        const functionalityId = '87a5ce0d-3565-4d00-b474-c8dd0d1ccdf7';
        const { status } = await global.testRequest
          .post(`/accounts/v1/${accountId}/functionality/${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();
        expect(status).toBe(StatusCodes.NOT_FOUND);
      });
    });

    describe('UnassignAccountPermission', () => {
      it('UnassignAccountPermission: should be able to unassign profile', async () => {
        const accountId = '13782202-684d-4ba9-9cad-487b9e4a6a8a';
        const functionalityId = '8c29a940-463c-4670-914a-ef57cfb8cb3e';

        await global.testRequest
          .post(`/accounts/v1/${accountId}/functionality/${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();

        const { status } = await global.testRequest
          .delete(`/accounts/v1/${accountId}/functionality/${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();
        expect(status).toBe(StatusCodes.NO_CONTENT);
      });

      it('UnassignAccountPermission: should be able to unassign even when profile and/or functionality not found', async () => {
        const accountId = '6df3ac1d-036c-4e3c-bb82-26a4e116bb23';
        const functionalityId = '0f590bd7-ac21-49d5-8637-27754a6d852e';
        const { status } = await global.testRequest
          .delete(`/accounts/v1/${accountId}/functionality/${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();
        expect(status).toBe(StatusCodes.NO_CONTENT);
      });
    });

    describe('GrantAndRevokeAccountPermission', () => {
      afterAll(async () => {
        const accountId = '13782202-684d-4ba9-9cad-487b9e4a6a8a';
        const functionalityId = '8c29a940-463c-4670-914a-ef57cfb8cb3e';
        await global.testRequest
          .delete(`/accounts/v1/${accountId}/functionality/${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();
      });
      it('GrantAndRevokeAccountPermission: should be able to grant and revoke permission', async () => {
        const accountId = '13782202-684d-4ba9-9cad-487b9e4a6a8a';
        const functionalityId = '8c29a940-463c-4670-914a-ef57cfb8cb3e';

        await global.testRequest
          .post(`/accounts/v1/${accountId}/functionality/${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();

        const { status } = await global.testRequest
          .patch(`/accounts/v1/${accountId}/functionality/${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();
        expect(status).toBe(StatusCodes.OK);

        const { body: allowedPermissions } = await global.testRequest
          .get(`/accounts/v1/permissions?accountId=${accountId}&functionalityId=${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();

        const [allowedPermission] = allowedPermissions.rows;
        expect(allowedPermission.account.id).toBe(accountId);
        expect(allowedPermission.functionality.id).toBe(functionalityId);
        expect(allowedPermission.allow).toBe(false);
        expect(allowedPermission.active).toBe(true);

        const { status: revokeStatus } = await global.testRequest
          .patch(`/accounts/v1/${accountId}/functionality/${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();
        expect(revokeStatus).toBe(StatusCodes.OK);

        const { body: notAllowedPermissions } = await global.testRequest
          .get(`/accounts/v1/permissions?accountId=${accountId}&functionalityId=${functionalityId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();

        const [notAllowedPermission] = notAllowedPermissions.rows;
        expect(allowedPermission.account.id).toBe(accountId);
        expect(allowedPermission.functionality.id).toBe(functionalityId);
        expect(notAllowedPermission.allow).toBe(true);
        expect(notAllowedPermission.active).toBe(true);
      });
    });

    describe('DeleteAccount', () => {
      it('DeleteById: should be able to delete account', async () => {
        const { body: createdAccount } = await global.testRequest
          .post('/accounts/v1')
          .set({ 'Content-Type': 'application/json' })
          .send({
            username: `john.doe+${Math.random()}@test.com`,
            password: 'secret',
          });

        const { status: getCreatedAccountStatus } = await global.testRequest
          .get(`/accounts/v1/${createdAccount.id}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();

        expect(getCreatedAccountStatus).not.toBe(StatusCodes.NOT_FOUND);

        const { status } = await global.testRequest
          .delete(`/accounts/v1/${createdAccount.id}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();
        expect(status).toBe(StatusCodes.NO_CONTENT);

        const { status: getDeletedAccountStatus } = await global.testRequest
          .get(`/accounts/v1/${createdAccount.id}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();

        expect(getDeletedAccountStatus).toBe(StatusCodes.NOT_FOUND);
      });

      it('DeleteByAuthorizedUser: should be able to delete account from logged user', async () => {
        const { status } = await global.testRequest
          .delete(`/accounts/v1/me`)
          .set({ Authorization: `Bearer ${token}` })
          .send();
        expect(status).toBe(StatusCodes.NO_CONTENT);

        const { status: getDeletedAccountStatus } = await global.testRequest
          .get(`/accounts/v1/${accountId}`)
          .set({ Authorization: `Bearer ${token}` })
          .send();

        expect(getDeletedAccountStatus).toBe(StatusCodes.NOT_FOUND);
      });
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
