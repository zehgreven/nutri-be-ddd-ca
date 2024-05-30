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

  describe('PatchProfile', () => {
    it('PatchProfile: should be able to patch profile', async () => {
      const profile = {
        name: 'PatchProfile Test',
        description: 'PatchProfile Description Test',
      };
      const { body: createdProfile } = await global.testRequest
        .post('/profiles/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send(profile);

      const { status, body } = await global.testRequest
        .patch(`/profiles/v1/${createdProfile.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          name: 'PatchProfile Test 2',
          description: 'PatchProfile Description Test 2',
        });

      expect(status).toBe(StatusCodes.OK);
    });
  });

  describe('ListProfiles', () => {
    it('ListProfiles: should be able to list profiles', async () => {
      const { status, body } = await global.testRequest
        .get('/profiles/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(status).toBe(StatusCodes.OK);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(10);
      expect(body.count).toBeGreaterThan(0);
      expect(body.rows.length).toBeGreaterThan(0);
    });
    it('ListProfiles: should be able to list profiles and filter by name', async () => {
      const { status, body } = await global.testRequest
        .get('/profiles/v1?page=1&limit=10&name=Admin')
        .set({ Authorization: `Bearer ${token}` })
        .send();

      expect(status).toBe(StatusCodes.OK);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(10);
      expect(body.count).toBe(1);
      expect(body.rows.length).toBe(1);
    });
    it('ListProfiles: should be able to list profiles and filter by description', async () => {
      const { status, body } = await global.testRequest
        .get('/profiles/v1?page=1&limit=10&description=de')
        .set({ Authorization: `Bearer ${token}` })
        .send();

      expect(status).toBe(StatusCodes.OK);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(10);
      expect(body.count).toBe(3);
      expect(body.rows.length).toBe(3);
    });
    it('ListProfiles: should be able to list profiles and filter by id', async () => {
      const { status, body } = await global.testRequest
        .get('/profiles/v1?page=1&limit=10&id=a81b2f88-fe8f-492c-aca5-7b09983c007d')
        .set({ Authorization: `Bearer ${token}` })
        .send();

      expect(status).toBe(StatusCodes.OK);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(10);
      expect(body.count).toBe(1);
      expect(body.rows.length).toBe(1);
    });
    it('ListProfiles: should be able to list profiles and filter by active', async () => {
      const { status, body } = await global.testRequest
        .get('/profiles/v1?page=1&active=true')
        .set({ Authorization: `Bearer ${token}` })
        .send();

      expect(status).toBe(StatusCodes.OK);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(10);
      expect(body.count).toBeGreaterThan(0);
      expect(body.rows.length).toBeGreaterThan(0);
    });
  });
});
