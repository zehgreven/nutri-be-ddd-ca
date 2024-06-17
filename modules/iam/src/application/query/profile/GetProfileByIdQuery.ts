import { ProfileNotFoundError } from '@src/domain/error/ProfileNotFoundError';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';

export class GetProfileByIdQuery {
  @inject('DatabaseConnection')
  private connection!: DatabaseConnection;

  async execute(id: string): Promise<Output> {
    logger.info(`GetProfileByIdQuery: getting profile by id=${id}`);
    const query = `
      select
        id,
        name,
        description,
        active
      from
        iam.profile
      where 1=1
        and deleted is null
        and id = $(id)
    `;
    const [profile] = await this.connection.query(query, { id });

    if (!profile) {
      throw new ProfileNotFoundError(`Unable to find profile with id=${id}`);
    }

    return profile;
  }
}

type Output = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};
