import Account from '@src/domain/entity/Account';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';

export interface AccountRepository {
  save(account: Account): Promise<void>;
  updateActive(account: Account): Promise<void>;
  updatePassword(account: Account): Promise<void>;
  getById(id: string): Promise<Account | undefined>;
  getByUsername(id: string): Promise<Account | undefined>;
  existsById(id: string): Promise<boolean>;
  deleteById(id: string): Promise<void>;
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

  async updateActive(account: Account): Promise<void> {
    const query = `UPDATE iam.account SET active = $(active) WHERE id = $(id)`;
    await this.connection.query(query, {
      id: account.id,
      active: account.isActive(),
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
    return Account.restore(account.id, account.username, account.password, account.active);
  }

  async getByUsername(username: string): Promise<Account | undefined> {
    const query = 'SELECT * FROM iam.account WHERE deleted is null and username = $(username)';
    const [account] = await this.connection.query(query, { username });
    if (!account) {
      return;
    }
    return Account.restore(account.id, account.username, account.password, account.active);
  }

  async existsById(id: string): Promise<boolean> {
    const query = 'SELECT 1 FROM iam.account WHERE deleted is null and id = $(id)';
    const [account] = await this.connection.query(query, { id: id });
    return !!account;
  }

  async deleteById(id: string): Promise<void> {
    const query = 'UPDATE iam.account SET deleted = now() WHERE id = $(id)';
    await this.connection.query(query, { id });
    this.connection.commit();
  }
}
