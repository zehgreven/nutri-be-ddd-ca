import { ListFunctionalityQuery } from '@src/application/query/functionality/ListFunctionalityQuery';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import sinon from 'sinon';

describe('ListFunctionalityQuery', () => {
  const defaultCountQueryResult = { count: 1 };
  const defaultRowQueryResult = {
    id: '9e0140cc-f97f-4a88-a4d4-9bf98b7edc39',
    name: 'name',
    description: 'description',
    path: 'path',
    active: true,
  };

  const connection: DatabaseConnection = {
    query: () => Promise.resolve([]),
    close: () => Promise.resolve(),
    commit: () => Promise.resolve(),
  };

  const listFunctionalityQuery = new ListFunctionalityQuery(connection);

  it('ListFunctionalityQuery: should be able to list functionalities and filter by name', async () => {
    const expectedArgs = {
      offset: 0,
      limit: 10,
      name: 'name',
    };

    const mock = sinon.mock(connection).expects('query').twice().withExactArgs(sinon.match.string, expectedArgs);

    mock.onFirstCall().resolves([defaultRowQueryResult]);
    mock.onSecondCall().resolves([defaultCountQueryResult]);

    const result = await listFunctionalityQuery.execute({
      name: 'name',
      page: 1,
      limit: 10,
    });

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.count).toBe(1);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].id).toBe(defaultRowQueryResult.id);
    expect(result.rows[0].name).toBe(defaultRowQueryResult.name);
    expect(result.rows[0].description).toBe(defaultRowQueryResult.description);
    expect(result.rows[0].active).toBe(defaultRowQueryResult.active);

    mock.verify();
    sinon.restore();
  });

  it('ListFunctionalityQuery: should be able to list functionalities and filter by description', async () => {
    const expectedArgs = {
      offset: 0,
      limit: 10,
      description: 'description',
    };

    const mock = sinon.mock(connection).expects('query').twice().withExactArgs(sinon.match.string, expectedArgs);

    mock.onFirstCall().resolves([defaultRowQueryResult]);
    mock.onSecondCall().resolves([defaultCountQueryResult]);

    const result = await listFunctionalityQuery.execute({
      description: 'description',
      page: 1,
      limit: 10,
    });

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.count).toBe(1);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].id).toBe(defaultRowQueryResult.id);
    expect(result.rows[0].name).toBe(defaultRowQueryResult.name);
    expect(result.rows[0].description).toBe(defaultRowQueryResult.description);
    expect(result.rows[0].active).toBe(defaultRowQueryResult.active);

    mock.verify();
    sinon.restore();
  });

  it('ListFunctionalityQuery: should be able to list functionalities and filter by id', async () => {
    const expectedArgs = {
      offset: 0,
      limit: 10,
      id: '9e0140cc-f97f-4a88-a4d4-9bf98b7edc39',
    };

    const mock = sinon.mock(connection).expects('query').twice().withExactArgs(sinon.match.string, expectedArgs);

    mock.onFirstCall().resolves([defaultRowQueryResult]);
    mock.onSecondCall().resolves([defaultCountQueryResult]);

    const result = await listFunctionalityQuery.execute({
      id: '9e0140cc-f97f-4a88-a4d4-9bf98b7edc39',
      page: 1,
      limit: 10,
    });

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.count).toBe(1);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].id).toBe(defaultRowQueryResult.id);
    expect(result.rows[0].name).toBe(defaultRowQueryResult.name);
    expect(result.rows[0].description).toBe(defaultRowQueryResult.description);
    expect(result.rows[0].active).toBe(defaultRowQueryResult.active);

    mock.verify();
    sinon.restore();
  });

  it('ListFunctionalityQuery: should be able to list functionalities and filter by active', async () => {
    const expectedArgs = {
      offset: 0,
      limit: 10,
      active: true,
    };

    const mock = sinon.mock(connection).expects('query').twice().withExactArgs(sinon.match.string, expectedArgs);

    mock.onFirstCall().resolves([defaultRowQueryResult]);
    mock.onSecondCall().resolves([defaultCountQueryResult]);

    const result = await listFunctionalityQuery.execute({
      active: true,
      page: 1,
      limit: 10,
    });

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.count).toBe(1);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].id).toBe(defaultRowQueryResult.id);
    expect(result.rows[0].name).toBe(defaultRowQueryResult.name);
    expect(result.rows[0].description).toBe(defaultRowQueryResult.description);
    expect(result.rows[0].active).toBe(defaultRowQueryResult.active);

    mock.verify();
    sinon.restore();
  });
});
