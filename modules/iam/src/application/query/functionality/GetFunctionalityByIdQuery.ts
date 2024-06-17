import { FunctionalityNotFoundError } from '@src/domain/error/FunctionalityNotFoundError';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';

export class GetFunctionalityByIdQuery {
  @inject('DatabaseConnection')
  private connection!: DatabaseConnection;

  async execute(id: string): Promise<Output> {
    logger.info(`GetFunctionalityByIdQuery: getting functionality by id=${id}`);
    const query = `
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
        and f.id = $(id)
    `;
    const [functionality] = await this.connection.query(query, { id });

    if (!functionality) {
      throw new FunctionalityNotFoundError(`Unable to find functionality with id=${id}`);
    }

    return {
      id: functionality.id,
      name: functionality.name,
      description: functionality.description,
      path: functionality.path,
      active: functionality.active,
      functionalityType: {
        id: functionality.functionality_type_id,
        name: functionality.functionality_type_name,
        description: functionality.functionality_type_description,
        active: functionality.functionality_type_active,
      },
    };
  }
}

type Output = {
  id: string;
  name: string;
  description: string;
  path: string;
  active: boolean;
  functionalityType: {
    id: string;
    name: string;
    description: string;
    active: boolean;
  };
};
