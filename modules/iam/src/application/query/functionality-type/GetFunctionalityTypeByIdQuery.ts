import { FunctionalityTypeNotFoundError } from '@src/domain/error/FunctionalityTypeNotFoundError';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';

export class GetFunctionalityTypeByIdQuery {
  @inject('DatabaseConnection')
  private connection!: DatabaseConnection;

  async execute(id: string): Promise<Output> {
    logger.info(`GetFunctionalityTypeByIdQuery: getting functionality type by id=${id}`);
    const query = `
      select
        id,
        name,
        description,
        active
      from
        iam.functionality_type
      where 1=1
        and deleted is null
        and id = $(id)
    `;
    const [functionalityType] = await this.connection.query(query, { id });

    if (!functionalityType) {
      throw new FunctionalityTypeNotFoundError(`Unable to find functionalityType with id=${id}`);
    }

    return functionalityType;
  }
}

type Output = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};
