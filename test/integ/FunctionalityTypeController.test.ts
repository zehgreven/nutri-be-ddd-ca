import config from 'config';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

describe('FunctionalityType Controller', () => {
  let token: string;

  beforeAll(async () => {
    const adminId = config.get<string>('default.adminId');
    const tokenKey = config.get<string>('auth.key');
    const tokenExpiration = config.get<string>('auth.expiration');
    token = jwt.sign({ id: adminId }, tokenKey, { expiresIn: tokenExpiration });
  });

  describe('CreateFunctionalityType', () => {
    it('CreateFunctionalityType: should be able to create a functionality type', async () => {
      const functionalityType = {
        name: 'FunctionalityType Test',
        description: 'Description Test',
      };
      const { status, body } = await global.testRequest
        .post('/functionality-types/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send(functionalityType);

      expect(status).toBe(StatusCodes.CREATED);
      expect(body.id).toBeDefined();
    });

    it('CreateFunctionalityType: should be authorized to create a functionality type', async () => {
      const functionalityType = {
        name: 'FunctionalityType Test',
        description: 'Description Test',
      };
      const { status } = await global.testRequest.post('/functionality-types/v1').send(functionalityType);
      expect(status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('GetFunctionalityTypeById', () => {
    it('GetFunctionalityTypeById: should be able to get functionalityType by id', async () => {
      const functionalityType = {
        name: 'GetFunctionalityTypeById Test',
        description: 'GetFunctionalityTypeById Description Test',
      };
      const { body: createdFunctionalityType } = await global.testRequest
        .post('/functionality-types/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send(functionalityType);

      const { status, body } = await global.testRequest
        .get(`/functionality-types/v1/${createdFunctionalityType.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(status).toBe(StatusCodes.OK);
      expect(body.id).toBeDefined();
    });

    it('GetFunctionalityTypeById: should be authorized to get functionalityType by id', async () => {
      const { status } = await global.testRequest
        .get(`/functionality-types/v1/27b45d06-ff53-4755-b799-2468e2987961`)
        .send();
      expect(status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('GetFunctionalityTypeById: should return error when functionalityType not found', async () => {
      const { status } = await global.testRequest
        .get(`/functionality-types/v1/faaa7ee4-f5c7-4dca-b65b-27331b1dcd4e`)
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe('PatchFunctionalityType', () => {
    it('PatchFunctionalityType: should be able to patch functionality type', async () => {
      const functionalityType = {
        name: 'PatchFunctionalityType Test',
        description: 'PatchFunctionalityType Description Test',
      };
      const { body: createdFunctionalityType } = await global.testRequest
        .post('/functionality-types/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send(functionalityType);

      const { status } = await global.testRequest
        .patch(`/functionality-types/v1/${createdFunctionalityType.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send({
          name: 'PatchFunctionalityType Test 2',
          description: 'PatchFunctionalityType Description Test 2',
        });

      expect(status).toBe(StatusCodes.OK);
    });
  });

  describe('ListFunctionalityTypes', () => {
    it('ListFunctionalityTypes: should be able to list functionalityTypes', async () => {
      const { status, body } = await global.testRequest
        .get('/functionality-types/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(status).toBe(StatusCodes.OK);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(10);
      expect(body.count).toBeGreaterThan(0);
      expect(body.rows.length).toBeGreaterThan(0);
    });
  });

  describe('DeleteFunctionalityType', () => {
    it('DeleteFunctionalityType: should be able to delete functionality type', async () => {
      const { body: createdFunctionalityType } = await global.testRequest
        .post('/functionality-types/v1')
        .set({ Authorization: `Bearer ${token}` })
        .send({
          name: 'DeleteFunctionalityType Test',
          description: 'DeleteFunctionalityType Description Test',
        });

      const { status } = await global.testRequest
        .delete(`/functionality-types/v1/${createdFunctionalityType.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(status).toBe(StatusCodes.NO_CONTENT);

      const { status: getByIdStatus } = await global.testRequest
        .get(`/functionality-types/v1/${createdFunctionalityType.id}`)
        .set({ Authorization: `Bearer ${token}` })
        .send();
      expect(getByIdStatus).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
