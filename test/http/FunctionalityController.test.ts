import { Server } from '@src/Server';
import { DatabaseTestContainer } from '@test/DatabaseTestContainer';
import config from 'config';
import { StatusCodes } from 'http-status-codes';
import supertest from 'supertest';

describe('Functionality Controller', () => {
  const defaultFunctionalityTypeId = '60d398d2-7f37-4728-8ebe-8d23871bbe31';
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

  describe('CreateFunctionality', () => {
    it('CreateFunctionality: should be able to create a functionality', async () => {
      const functionalityType = {
        functionalityTypeId: defaultFunctionalityTypeId,
        name: 'Functionality Test',
        description: 'Description Test',
      };
      const { status, body } = await global.testRequest
        .post('/functionalities/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send(functionalityType);

      expect(status).toBe(StatusCodes.CREATED);
      expect(body.id).toBeDefined();
    });

    it('CreateFunctionality: should be authorized to create a functionality', async () => {
      const functionalityType = {
        functionalityTypeId: defaultFunctionalityTypeId,
        name: 'Functionality Test',
        description: 'Description Test',
      };
      const { status } = await global.testRequest.post('/functionalities/v1').send(functionalityType);
      expect(status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('GetFunctionalityById', () => {
    it('GetFunctionalityById: should be able to get functionalityType by id', async () => {
      const functionalityType = {
        functionalityTypeId: defaultFunctionalityTypeId,
        name: 'GetFunctionalityById Test',
        description: 'GetFunctionalityById Description Test',
      };
      const { body: createdFunctionality } = await global.testRequest
        .post('/functionalities/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send(functionalityType);

      const { status, body } = await global.testRequest
        .get(`/functionalities/v1/${createdFunctionality.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(status).toBe(StatusCodes.OK);
      expect(body.id).toBeDefined();
    });

    it('GetFunctionalityById: should be authorized to get functionalityType by id', async () => {
      const { status } = await global.testRequest
        .get(`/functionalities/v1/27b45d06-ff53-4755-b799-2468e2987961`)
        .send();
      expect(status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('GetFunctionalityById: should return error when functionalityType not found', async () => {
      const { status } = await global.testRequest
        .get(`/functionalities/v1/faaa7ee4-f5c7-4dca-b65b-27331b1dcd4e`)
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('PatchFunctionality', () => {
    it('PatchFunctionality: should be able to patch functionality', async () => {
      const functionalityType = {
        functionalityTypeId: defaultFunctionalityTypeId,
        name: 'PatchFunctionality Test',
        description: 'PatchFunctionality Description Test',
      };
      const { body: createdFunctionality } = await global.testRequest
        .post('/functionalities/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send(functionalityType);

      const { status } = await global.testRequest
        .patch(`/functionalities/v1/${createdFunctionality.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          functionalityTypeId: '52a19d20-9904-4a2d-b7c5-ff3d25b80e41',
          name: 'PatchFunctionality Test 2',
          description: 'PatchFunctionality Description Test 2',
          path: 'test',
        });
      expect(status).toBe(StatusCodes.OK);
    });
  });

  describe('ListFunctionalities', () => {
    it('ListFunctionalities: should be able to list functionality', async () => {
      const { status, body } = await global.testRequest
        .get('/functionalities/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(status).toBe(StatusCodes.OK);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(10);
      expect(body.count).toBeGreaterThan(0);
      expect(body.rows.length).toBeGreaterThan(0);
    });
  });

  describe('DeleteFunctionality', () => {
    it('DeleteFunctionality: should be able to delete functionality', async () => {
      const { body: createdFunctionality } = await global.testRequest
        .post('/functionalities/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          functionalityTypeId: defaultFunctionalityTypeId,
          name: 'DeleteFunctionality Test',
          description: 'DeleteFunctionality Description Test',
        });

      const { status } = await global.testRequest
        .delete(`/functionalities/v1/${createdFunctionality.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(status).toBe(StatusCodes.NO_CONTENT);

      const { status: getByIdStatus } = await global.testRequest
        .get(`/functionalities/v1/${createdFunctionality.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(getByIdStatus).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
