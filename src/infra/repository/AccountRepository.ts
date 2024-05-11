import Account from '../../domain/entity/Account';
import DatabaseConnection from '../database/DatabaseConnection';

export interface AccountRepository {
  save(account: Account): Promise<void>;
  getById(id: string): Promise<Account | undefined>;
}

export class AccountRepositoryPostgres implements AccountRepository {
  constructor(private connection: DatabaseConnection) {}

  async save(account: Account): Promise<void> {
    const query = `INSERT INTO iam.account (id, username, password) VALUES (:id, :username, :password)`;
    await this.connection.query(query, {
      id: account.id,
      username: account.getUsername(),
      password: account.getPassword(),
    });
    this.connection.commit();
  }
  async getById(id: string): Promise<Account | undefined> {
    const query = 'SELECT * FROM iam.account WHERE id = :id';
    const [account] = await this.connection.query(query, { id: id });
    if (!account) {
      return;
    }
    return Account.restore(account.id, account.username, account.password);
  }
}

export class AccountRepositoryMemoryDatabase implements AccountRepository {
  accounts: Account[] = [];

  async save(account: Account): Promise<void> {
    this.accounts.push(account);
  }

  async getById(id: string): Promise<Account | undefined> {
    return this.accounts.find(account => account.id === id);
  }
}
