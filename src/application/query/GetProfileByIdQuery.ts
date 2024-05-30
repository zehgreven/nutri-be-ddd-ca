import { ProfileNotFoundError } from '@src/domain/error/ProfileNotFoundError';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';

export class GetProfileByIdQuery {
  constructor(readonly connection: DatabaseConnection) {}

  async execute(id: string): Promise<Output> {
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
