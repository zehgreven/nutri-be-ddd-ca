import { Server } from '@src/Server';
import { DatabaseTestContainer } from '@test/helpers/DatabaseTestContainer';
import config from 'config';
import { StatusCodes } from 'http-status-codes';
import supertest from 'supertest';

describe('Profile Controller', () => {
  let server: Server;
  let token: string;

  beforeAll(async () => {
    const dbContainer = DatabaseTestContainer.getInstance();
    await dbContainer.start();

    server = new Server(config.get('server.port'), dbContainer.getConnectionUri());
    server.init();

    global.testRequest = supertest(server.getApp());

    const account: any = { username: `john.doe+${Math.random()}@test.com`, password: 'secret' };

    await global.testRequest.post('/accounts/v1').set({ 'Content-Type': 'application/json' }).send(account);

    const { body: auth } = await global.testRequest
      .post('/auth/v1/authenticate')
      .set({ 'Content-Type': 'application/json' })
      .send(account);

    token = auth.token;
  });

  describe('CreateProfile', () => {
    it('CreateProfile: should be able to create a profile', async () => {
      const profile = {
        name: 'Profile Test',
        description: 'Description Test',
      };
      const { status, body } = await global.testRequest
        .post('/profiles/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send(profile);

      expect(status).toBe(StatusCodes.CREATED);
      expect(body.id).toBeDefined();
    });

    it('CreateProfile: should be authorized to create a profile', async () => {
      const profile = {
        name: 'Profile Test',
        description: 'Description Test',
      };
      const { status, body } = await global.testRequest.post('/profiles/v1').send(profile);
      expect(status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('GetProfileById', () => {
    it('GetProfileById: should be able to get profile by id', async () => {
      const profile = {
        name: 'GetProfileById Test',
        description: 'GetProfileById Description Test',
      };
      const { body: createdProfile } = await global.testRequest
        .post('/profiles/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send(profile);

      const { status, body } = await global.testRequest
        .get(`/profiles/v1/${createdProfile.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(status).toBe(StatusCodes.OK);
      expect(body.id).toBeDefined();
    });

    it('GetProfileById: should be authorized to get profile by id', async () => {
      const { status } = await global.testRequest.get(`/profiles/v1/27b45d06-ff53-4755-b799-2468e2987961`).send();
      expect(status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('GetProfileById: should return error when profile not found', async () => {
      const { status } = await global.testRequest
        .get(`/profiles/v1/faaa7ee4-f5c7-4dca-b65b-27331b1dcd4e`)
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(status).toBe(StatusCodes.NOT_FOUND);
    });
  });
});