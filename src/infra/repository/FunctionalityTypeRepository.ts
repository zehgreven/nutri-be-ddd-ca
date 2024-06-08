import FunctionalityType from '@src/domain/entity/FunctionalityType';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';

export interface FunctionalityTypeRepository {
  save(profile: FunctionalityType): Promise<void>;
  update(profile: FunctionalityType): Promise<void>;
  getById(id: string): Promise<FunctionalityType | undefined>;
  deleteById(id: string): Promise<void>;
}

export class FunctionalityTypeRepositoryPostgres implements FunctionalityTypeRepository {
  constructor(private connection: DatabaseConnection) {}

  async save(profile: FunctionalityType): Promise<void> {
    const query =
      'insert into iam.functionality_type (id, name, description, active) values ($(id), $(name), $(description), $(active))';
    await this.connection.query(query, {
      id: profile.id,
      name: profile.getName(),
      description: profile.getDescription(),
      active: profile.isActive(),
    });
    this.connection.commit();
  }

  async update(profile: FunctionalityType): Promise<void> {
    const query =
      'update iam.functionality_type set name = $(name), description = $(description), active = $(active) where id = $(id)';
    await this.connection.query(query, {
      id: profile.id,
      name: profile.getName(),
      description: profile.getDescription(),
      active: profile.isActive(),
    });
    this.connection.commit();
  }

  async getById(id: string): Promise<FunctionalityType | undefined> {
    const query =
      'select id, name, description, active from iam.functionality_type where deleted is null and id = $(id)';
    const [profile] = await this.connection.query(query, { id });
    if (!profile) {
      return;
    }
    return FunctionalityType.restore(profile.id, profile.name, profile.description, profile.active);
  }

  async deleteById(id: string): Promise<void> {
    const query = 'update iam.functionality_type set deleted = now() where id = $(id)';
    await this.connection.query(query, { id });
    this.connection.commit();
  }
}
