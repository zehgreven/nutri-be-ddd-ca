import DatabaseConnection, { PgPromiseAdapter } from '../src/infra/database/DatabaseConnection';

import Account from '../src/domain/entity/Account';
import { AccountRepository, AccountRepositoryPostgres } from '../src/infra/repository/AccountRepository';
import { DatabaseTestContainer } from './helpers/DatabaseTestContainer';

describe('Account Repository', () => {
  jest.setTimeout(60000);

  const dbContainer = DatabaseTestContainer.getInstance();
  let postgresClient: DatabaseConnection;
  let accountRepository: AccountRepository;

  beforeAll(async () => {
    await dbContainer.start();
    postgresClient = new PgPromiseAdapter(dbContainer.getConnectionUri());
    accountRepository = new AccountRepositoryPostgres(postgresClient);
  });

  afterAll(async () => {
    await postgresClient.close();
    await dbContainer.stop();
  });

  beforeEach(async () => {
    await postgresClient.query('truncate iam.account cascade;');
  });

  test('should be able to create account and get it by id', async () => {
    const account = Account.create('johndoe@test.com', 'secret');
    await accountRepository.save(account);

    const user = await accountRepository.getById(account.id);
    expect(user?.id).toBe(account.id);
    expect(user?.getUsername()).toBe(account.getUsername());
    expect(user?.getPassword()).toBe(account.getPassword());
  });

  test('should be able to get by username', async () => {
    const account = Account.create('johndoe@test.com', 'secret');
    await accountRepository.save(account);

    const user = await accountRepository.getByUsername(account.getUsername());
    expect(user?.id).toBe(account.id);
    expect(user?.getUsername()).toBe(account.getUsername());
    expect(user?.getPassword()).toBe(account.getPassword());
  });

  test("should return undefined when account doesn't exists by id", async () => {
    const user = await accountRepository.getById('0c869b6e-a593-40d3-97e2-63876b1a5b73');
    expect(user).toBeUndefined();
  });

  test("should return undefined when account doesn't exists by username", async () => {
    const user = await accountRepository.getByUsername('invalid_username');
    expect(user).toBeUndefined();
  });
});
