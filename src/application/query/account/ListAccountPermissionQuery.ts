import { Paginated } from '@src/application/model/Page';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import logger from '@src/infra/logging/logger';

export class ListAccountPermissionQuery {
  constructor(readonly connection: DatabaseConnection) {}

  async execute(input: Partial<AccountPermissionInput>): Promise<Partial<Paginated<AccountPermission>>> {
    logger.info(`ListAccountPermissionQuery: listing account permission with input=${JSON.stringify(input)}`);
    const rowQuery = `
      select
        pp.id,
        pp.allow,
        pp.active,
        a.id as "accountId",
        a.username as "accountUsename",
        f.id as "functionalityId",
        f.name as "functionalityName",
        ft.id as "functionalityTypeId",
        ft.name as "functionalityTypeName"
      from
        iam.account_permission as pp
      inner join
        iam.account as a 
          on a.id = pp.account_id
          and a.deleted is null
      inner join
        iam.functionality as f
          on f.id = pp.functionality_id
          and f.deleted is null
      inner join
        iam.functionality_type as ft
          on ft.id = f.functionality_type_id
          and ft.deleted is null
      where 1=1
        and pp.deleted is null
      ${input.accountId ? 'and pp.account_id = $(accountId)' : ''}
      ${input.functionalityId ? 'and pp.functionality_id = $(functionalityId)' : ''}
      order by
        pp.id
    `;
    const rowsResult = await this.connection.query(rowQuery, input);
    return {
      rows: this.toOutput(rowsResult),
      count: rowsResult.length,
    };
  }

  private toOutput(rowsResult: any): AccountPermission[] | undefined {
    return rowsResult.map((row: any) => ({
      id: row.id,
      allow: row.allow,
      active: row.active,
      account: {
        id: row.accountId,
        username: row.accountUsename,
      },
      functionality: {
        id: row.functionalityId,
        name: row.functionalityName,
        functionalityType: {
          id: row.functionalityTypeId,
          name: row.functionalityTypeName,
        },
      },
    }));
  }
}

type AccountPermissionInput = {
  id: string;
  allow: boolean;
  active: boolean;
  accountId: string;
  functionalityId: string;
};

type AccountPermission = {
  id: string;
  allow: boolean;
  active: boolean;
  account: Account;
  functionality: Functionality;
};

type Account = {
  id: string;
  username: string;
};

type Functionality = {
  id: string;
  name: string;
  functionalityType: FunctionalityType;
};

type FunctionalityType = {
  id: string;
  name: string;
};
