import { Paginated, Paging } from '@src/application/model/Page';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import logger from '@src/infra/logging/logger';

export class ListFunctionalityTypeQuery {
  constructor(readonly connection: DatabaseConnection) {}

  async execute(input: Partial<FunctionalityType> & Paging<FunctionalityType>): Promise<Paginated<FunctionalityType>> {
    logger.info(`ListFunctionalityTypeQuery: listing functionality type with input=${JSON.stringify(input)}`);
    const countQuery = `
      select
        count(1) as count
      from
        iam.functionality_type
      where 1=1
        and deleted is null
      ${input.name ? 'and name like $(name)' : ''}
      ${input.description ? "and description like '%$(description:value)%'" : ''}
      ${input.active ? 'and active = $(active)' : ''}
      ${input.id ? 'and id = $(id)' : ''}
    `;

    const rowQuery = `
      select
        id,
        name,
        description,
        active
      from
        iam.functionality_type
      where 1=1
        and deleted is null
      ${input.name ? 'and name like $(name)' : ''}
      ${input.description ? "and description like '%$(description:value)%'" : ''}
      ${input.active ? 'and active = $(active)' : ''}
      ${input.id ? 'and id = $(id)' : ''}
      order by
        ${input.orderBy || 'name'} ${input.order || 'asc'}
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
      ...(input.active && { active: input.active }),
    };

    const rows = await this.connection.query(rowQuery, params);
    const [{ count }] = await this.connection.query(countQuery, params);
    return {
      page: parseInt(input.page.toString()),
      limit: parseInt(input.limit.toString()),
      count: parseInt(count),
      rows,
    };
  }
}

type FunctionalityType = {
  id?: string;
  name?: string;
  description?: string;
  active?: boolean;
};
