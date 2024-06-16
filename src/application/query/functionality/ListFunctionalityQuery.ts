import { Paginated, Paging } from '@src/application/model/Page';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';

export class ListFunctionalityQuery {
  @inject('DatabaseConnection')
  private connection!: DatabaseConnection;

  async execute(input: Partial<Functionality> & Paging<Functionality>): Promise<Paginated<Functionality>> {
    logger.info(`ListFunctionalityQuery: listing functionality with input=${JSON.stringify(input)}`);
    const countQuery = `
      select
        count(1) as count
      from
        iam.functionality
      where 1=1
        and deleted is null
      ${input.name ? "and name like '%$(name)%'" : ''}
      ${input.description ? "and description like '%$(description:value)%'" : ''}
      ${input.path ? "and path like '%$(path:value)%'" : ''}
      ${input.active ? 'and active = $(active)' : ''}
      ${input.id ? 'and id = $(id)' : ''}
    `;

    const rowQuery = `
      select
        f.id,
        f.name,
        f.description,
        f.path,
        f.active,
        f.functionality_type_id,
        ft.name as "functionality_type_name",
        ft.description as "functionality_type_description",
        ft.active as "functionality_type_active"
      from
        iam.functionality as f
      inner join
        iam.functionality_type as ft
          on ft.id = f.functionality_type_id
      where 1=1
        and f.deleted is null
        and ft.deleted is null
      ${input.name ? "and f.name like '%$(name)%'" : ''}
      ${input.description ? "and f.description like '%$(description:value)%'" : ''}
      ${input.path ? "and f.path like '%$(path:value)%'" : ''}
      ${input.active ? 'and f.active = $(active)' : ''}
      ${input.id ? 'and f.id = $(id)' : ''}
      order by
        ${input.orderBy || 'f.name'} ${input.order || 'asc'}
      offset
        $(offset)
      limit
        $(limit)
    `;

    const params = {
      offset: (input.page - 1) * input.limit,
      limit: input.limit,
      ...(input.id && { id: input.id }),
      ...(input.name && { name: input.name }),
      ...(input.description && { description: input.description }),
      ...(input.path && { path: input.path }),
      ...(input.active && { active: input.active }),
    };

    const rows = await this.connection.query(rowQuery, params);

    const functionalityMapper = (row: any) => {
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        path: row.path,
        active: row.active,
        functionalityType: {
          id: row.functionality_type_id,
          name: row.functionality_type_name,
          description: row.functionality_type_description,
          active: row.functionality_type_active,
        },
      };
    };

    const [{ count }] = await this.connection.query(countQuery, params);
    return {
      page: parseInt(input.page.toString()),
      limit: parseInt(input.limit.toString()),
      count: parseInt(count),
      rows: rows.map(functionalityMapper),
    };
  }
}

type Functionality = {
  id?: string;
  name?: string;
  description?: string;
  path?: string;
  active?: boolean;
};
