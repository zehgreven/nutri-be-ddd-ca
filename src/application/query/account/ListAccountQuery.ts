import { Paginated, Paging } from '@src/application/model/Page';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';

export class ListAccountQuery {
  @inject('DatabaseConnection')
  private connection!: DatabaseConnection;

  async execute(input: Partial<Account> & Paging<Account>): Promise<Paginated<Account>> {
    logger.info(`Account: listing account with input=${JSON.stringify(input)}`);
    const countQuery = `
      select
        count(1) as count
      from
        iam.account
      where 1=1
        and deleted is null
      ${input.username ? "and username like '%$(username:value)%'" : ''}
      ${input.active ? 'and active = $(active)' : ''}
      ${input.id ? 'and id = $(id)' : ''}
    `;

    const rowQuery = `
      select
        id,
        username,
        active
      from
        iam.account
      where 1=1
        and deleted is null
      ${input.username ? "and username like '%$(username:value)%'" : ''}
      ${input.active ? 'and active = $(active)' : ''}
      ${input.id ? 'and id = $(id)' : ''}
      order by
        ${input.orderBy || 'username'} ${input.order || 'asc'}
      offset
        $(offset)
      limit
        $(limit)
    `;

    const params = {
      offset: (input.page - 1) * input.limit,
      limit: input.limit,
      ...(input.id && { id: input.id }),
      ...(input.username && { username: input.username }),
      ...(input.active && { active: input.active }),
    };

    const rows = await this.connection.query(rowQuery, params);
    const [{ count }] = await this.connection.query(countQuery, params);

    const accountMapper = (row: any) => {
      return {
        id: row.id,
        username: row.username,
        active: row.active,
      };
    };

    return {
      page: parseInt(input.page.toString()),
      limit: parseInt(input.limit.toString()),
      count: parseInt(count),
      rows: rows.map(accountMapper),
    };
  }
}

type Account = {
  id: string;
  username: string;
  active: boolean;
};
