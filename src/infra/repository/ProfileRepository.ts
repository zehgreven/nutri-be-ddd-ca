import Profile from '@src/domain/entity/Profile';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';

export interface ProfileRepository {
  save(profile: Profile): Promise<void>;
}

export class ProfileRepositoryPostgres implements ProfileRepository {
  constructor(private connection: DatabaseConnection) {}

  async save(profile: Profile): Promise<void> {
    const query = `INSERT INTO iam.profile (id, name, description, active) VALUES (:id, :name, :description, :active)`;
    await this.connection.query(query, {
      id: profile.id,
      name: profile.getName(),
      description: profile.getDescription(),
      active: profile.isActive(),
    });
    this.connection.commit();
  }
}

export class ProfileRepositoryMemoryDatabase implements ProfileRepository {
  profiles: Profile[] = [];

  async save(profile: Profile): Promise<void> {
    this.profiles.push(profile);
  }

  async getById(id: string): Promise<Profile | undefined> {
    return this.profiles.find(profile => profile.id === id);
  }
}
