import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';

export class GetAccountByIdQuery {
  constructor(readonly connection: DatabaseConnection) {}

  async execute(id: string): Promise<Output> {
    const accountQuery = `
      select
        id,
        username,
        password
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
  profiles: Profile[];
};

type Profile = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};
