import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';

export class GetAccountByIdQuery {
  @inject('DatabaseConnection')
  private connection!: DatabaseConnection;

  async execute(id: string): Promise<Output> {
    logger.info(`GetAccountByIdQuery: getting account by id=${id}`);
    const accountQuery = `
      select
        id,
        username,
        active
      from
        iam.account
      where 1=1
        and deleted is null
        and id = $(id)
    `;
    const [account] = await this.connection.query(accountQuery, { id });
    if (!account) {
      throw new AccountNotFoundError(`Unable to find account with id=${id}`);
    }

    const profileQuery = `
      select
        p.id,
        p.name,
        p.description,
        p.active
      from
        iam.profile as p
      inner join
        iam.account_profile as ap
          on ap.profile_id = p.id
      where 1=1
        and ap.deleted is null
        and p.deleted is null
        and p.active is true
        and ap.account_id = $(id)
    `;
    account.profiles = await this.connection.query(profileQuery, { id });

    return account;
  }
}

type Output = {
  id: string;
  username: string;
  password: string;
  active: boolean;
  profiles: Profile[];
};

type Profile = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};
