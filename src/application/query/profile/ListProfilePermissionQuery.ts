import { Paginated } from '@src/application/model/Page';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';

export class ListProfilePermissionQuery {
  @inject('DatabaseConnection')
  private connection!: DatabaseConnection;

  async execute(input: Partial<ProfilePermissionInput>): Promise<Partial<Paginated<ProfilePermission>>> {
    logger.info(`ListProfilePermissionQuery: listing profile permission with input=${JSON.stringify(input)}`);
    const rowQuery = `
      select
        pp.id,
        pp.allow,
        pp.active,
        p.id as "profileId",
        p.name as "profileName",
        f.id as "functionalityId",
        f.name as "functionalityName",
        ft.id as "functionalityTypeId",
        ft.name as "functionalityTypeName"
      from
        iam.profile_permission as pp
      inner join
        iam.profile as p 
          on p.id = pp.profile_id
          and p.deleted is null
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
      ${input.profileId ? 'and pp.profile_id = $(profileId)' : ''}
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

  private toOutput(rowsResult: any): ProfilePermission[] | undefined {
    return rowsResult.map((row: any) => ({
      id: row.id,
      allow: row.allow,
      active: row.active,
      profile: {
        id: row.profileId,
        name: row.profileName,
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

type ProfilePermissionInput = {
  id: string;
  allow: boolean;
  active: boolean;
  profileId: string;
  functionalityId: string;
};

type ProfilePermission = {
  id: string;
  allow: boolean;
  active: boolean;
  profile: Profile;
  functionality: Functionality;
};

type Profile = {
  id: string;
  name: string;
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
