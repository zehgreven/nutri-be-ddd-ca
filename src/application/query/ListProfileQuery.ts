import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import logger from '@src/infra/logging/logger';
import { Paginated, Paging } from '../model/Page';

export class ListProfileQuery {
  constructor(readonly connection: DatabaseConnection) {}

  async execute(input: Partial<Profile> & Paging<Profile>): Promise<Paginated<Profile>> {
    logger.info(`ListProfileQuery: listing profile with input=${JSON.stringify(input)}`);
    let countQuery = `
      select
        count(1) as count
      from
        iam.profile
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
        iam.profile
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

type Profile = {
  id?: string;
  name?: string;
  description?: string;
  active?: boolean;
};
