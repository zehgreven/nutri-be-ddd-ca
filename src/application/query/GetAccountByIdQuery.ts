import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';

export class GetAccountByIdQuery {
  constructor(readonly connection: DatabaseConnection) {}

  async execute(id: string): Promise<Output> {
    const query = `
      select
        id,
        username,
        password
      from
        iam.account
      where
        id = $(id)
    `;
    const [account] = await this.connection.query(query, { id });

    if (!account) {
      throw new AccountNotFoundError(`Unable to find account with id=${id}`);
    }

    return account;
  }
}

type Output = {
  id: string;
  username: string;
  password: string;
};
