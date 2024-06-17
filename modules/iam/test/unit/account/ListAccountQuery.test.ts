import { ListAccountQuery } from '@src/application/query/account/ListAccountQuery';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import Registry from '@src/infra/dependency-injection/Registry';
import sinon from 'sinon';

describe('ListAccountQuery', () => {
  const defaultCountQueryResult = { count: 1 };
  const defaultRowQueryResult = {
    id: '9e0140cc-f97f-4a88-a4d4-9bf98b7edc39',
    username: 'username',
    active: true,
  };

  const connection: DatabaseConnection = {
    query: () => Promise.resolve([]),
    close: () => Promise.resolve(),
    commit: () => Promise.resolve(),
  };
  Registry.getInstance().register('DatabaseConnection', connection);

  const listAccountQuery = new ListAccountQuery();

  afterEach(() => {
    sinon.restore();
  });

  it('ListAccountQuery: should be able to list accounts and filter by username', async () => {
    const expectedArgs = {
      offset: 0,
      limit: 10,
      username: 'username',
    };

    const mock = sinon.mock(connection).expects('query').twice().withExactArgs(sinon.match.string, expectedArgs);

    mock.onFirstCall().resolves([defaultRowQueryResult]);
    mock.onSecondCall().resolves([defaultCountQueryResult]);

    const result = await listAccountQuery.execute({
      username: 'username',
      page: 1,
      limit: 10,
    });

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.count).toBe(1);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].id).toBe(defaultRowQueryResult.id);
    expect(result.rows[0].username).toBe(defaultRowQueryResult.username);
    expect(result.rows[0].active).toBe(defaultRowQueryResult.active);

    mock.verify();
  });

  it('ListAccountQuery: should be able to list accounts and filter by id', async () => {
    const expectedArgs = {
      offset: 0,
      limit: 10,
      id: '9e0140cc-f97f-4a88-a4d4-9bf98b7edc39',
    };

    const mock = sinon.mock(connection).expects('query').twice().withExactArgs(sinon.match.string, expectedArgs);

    mock.onFirstCall().resolves([defaultRowQueryResult]);
    mock.onSecondCall().resolves([defaultCountQueryResult]);

    const result = await listAccountQuery.execute({
      id: '9e0140cc-f97f-4a88-a4d4-9bf98b7edc39',
      page: 1,
      limit: 10,
    });

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.count).toBe(1);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].id).toBe(defaultRowQueryResult.id);
    expect(result.rows[0].username).toBe(defaultRowQueryResult.username);
    expect(result.rows[0].active).toBe(defaultRowQueryResult.active);

    mock.verify();
  });

  it('ListAccountQuery: should be able to list accounts and filter by active', async () => {
    const expectedArgs = {
      offset: 0,
      limit: 10,
      active: true,
    };

    const mock = sinon.mock(connection).expects('query').twice().withExactArgs(sinon.match.string, expectedArgs);

    mock.onFirstCall().resolves([defaultRowQueryResult]);
    mock.onSecondCall().resolves([defaultCountQueryResult]);

    const result = await listAccountQuery.execute({
      active: true,
      page: 1,
      limit: 10,
    });

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.count).toBe(1);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].id).toBe(defaultRowQueryResult.id);
    expect(result.rows[0].username).toBe(defaultRowQueryResult.username);
    expect(result.rows[0].active).toBe(defaultRowQueryResult.active);

    mock.verify();
  });
});
