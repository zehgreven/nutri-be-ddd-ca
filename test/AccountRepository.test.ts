import DatabaseConnection, { PgPromiseAdapter } from '../src/infra/database/DatabaseConnection';

import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { AccountRepository, AccountRepositoryPostgres } from '../src/infra/repository/AccountRepository';
import Account from '../src/domain/entity/Account';

describe('Customer Repository', () => {
  jest.setTimeout(60000);

  let postgresContainer: StartedPostgreSqlContainer;
  let postgresClient: DatabaseConnection;
  let accountRepository: AccountRepository;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer().start();

    postgresClient = new PgPromiseAdapter(postgresContainer.getConnectionUri());
    await postgresClient.query(`
      create schema iam;
      create table iam.account (
        id uuid primary key,
        username text not null,
        password text not null
      );
    `);

    accountRepository = new AccountRepositoryPostgres(postgresClient);
  });

  afterAll(async () => {
    await postgresClient.close();
    await postgresContainer.stop();
  });

  test('should be abel to create account and get it by id', async () => {
    const account = Account.create('johndoe@test.com', 'secret');
    await accountRepository.save(account);

    const user = await accountRepository.getById(account.id);
    expect(user?.id).toBe(account.id);
    expect(user?.getUsername()).toBe(account.getUsername());
    expect(user?.getPassword()).toBe(account.getPassword());
  });

  test("should return undefined when account doesn't exists", async () => {
    const user = await accountRepository.getById('0c869b6e-a593-40d3-97e2-63876b1a5b73');
    expect(user).toBeUndefined();
  });
});
