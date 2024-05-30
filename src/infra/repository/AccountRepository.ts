import Account from '@src/domain/entity/Account';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';

export interface AccountRepository {
  save(account: Account): Promise<void>;
  updatePassword(account: Account): Promise<void>;
  getById(id: string): Promise<Account | undefined>;
  getByUsername(id: string): Promise<Account | undefined>;
}

export class AccountRepositoryPostgres implements AccountRepository {
  constructor(private connection: DatabaseConnection) {}

  async save(account: Account): Promise<void> {
    const query = `INSERT INTO iam.account (id, username, password) VALUES ($(id), $(username), $(password))`;
    await this.connection.query(query, {
      id: account.id,
      username: account.getUsername(),
      password: account.getPassword(),
    });
    this.connection.commit();
  }

  async updatePassword(account: Account): Promise<void> {
    const query = `UPDATE iam.account SET password = $(password) WHERE id = $(id)`;
    await this.connection.query(query, {
      id: account.id,
      password: account.getPassword(),
    });
    this.connection.commit();
  }

  async getById(id: string): Promise<Account | undefined> {
    const query = 'SELECT * FROM iam.account WHERE deleted is null and id = $(id)';
    const [account] = await this.connection.query(query, { id: id });
    if (!account) {
      return;
    }
    return Account.restore(account.id, account.username, account.password);
  }

  async getByUsername(username: string): Promise<Account | undefined> {
    const query = 'SELECT * FROM iam.account WHERE deleted is null and username = $(username)';
    const [account] = await this.connection.query(query, { username });
    if (!account) {
      return;
    }
    return Account.restore(account.id, account.username, account.password);
  }
}

export class AccountRepositoryMemoryDatabase implements AccountRepository {
  accounts: Account[] = [];

  clear(): void {
    this.accounts = [];
  }

  async save(account: Account): Promise<void> {
    this.accounts.push(account);
  }

  async updatePassword(account: Account): Promise<void> {
    const index = this.accounts.findIndex(a => a.id === account.id);
    this.accounts[index] = account;
  }

  async getById(id: string): Promise<Account | undefined> {
    return this.accounts.find(account => account.id === id);
  }

  async getByUsername(username: string): Promise<Account | undefined> {
    return this.accounts.find(account => account.getUsername() === username);
  }
}
