import Profile from '@src/domain/entity/Profile';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';

export interface ProfileRepository {
  save(profile: Profile): Promise<void>;
  update(profile: Profile): Promise<void>;
  getById(id: string): Promise<Profile | undefined>;
  deleteById(id: string): Promise<void>;
  existsById(id: string): Promise<boolean>;
}

export class ProfileRepositoryPostgres implements ProfileRepository {
  constructor(private connection: DatabaseConnection) {}

  async save(profile: Profile): Promise<void> {
    const query =
      'insert into iam.profile (id, name, description, active) values ($(id), $(name), $(description), $(active))';
    await this.connection.query(query, {
      id: profile.id,
      name: profile.getName(),
      description: profile.getDescription(),
      active: profile.isActive(),
    });
    this.connection.commit();
  }

  async update(profile: Profile): Promise<void> {
    const query =
      'update iam.profile set name = $(name), description = $(description), active = $(active) where id = $(id)';
    await this.connection.query(query, {
      id: profile.id,
      name: profile.getName(),
      description: profile.getDescription(),
      active: profile.isActive(),
    });
    this.connection.commit();
  }

  async getById(id: string): Promise<Profile | undefined> {
    const query = 'select id, name, description, active from iam.profile where deleted is null and id = $(id)';
    const [profile] = await this.connection.query(query, { id });
    if (!profile) {
      return;
    }
    return Profile.restore(profile.id, profile.name, profile.description, profile.active);
  }

  async deleteById(id: string): Promise<void> {
    const query = 'update iam.profile set deleted = now() where id = $(id)';
    await this.connection.query(query, { id });
    this.connection.commit();
  }

  async existsById(id: string): Promise<boolean> {
    const query = 'select 1 from iam.profile where deleted is null and id = $(id)';
    const [profile] = await this.connection.query(query, { id });
    return !!profile;
  }
}

export class ProfileRepositoryMemoryDatabase implements ProfileRepository {
  profiles: Profile[] = [];

  async save(profile: Profile): Promise<void> {
    this.profiles.push(profile);
  }

  async update(profile: Profile): Promise<void> {
    const index = this.profiles.findIndex(p => p.id === profile.id);
    this.profiles[index] = profile;
  }

  async getById(id: string): Promise<Profile | undefined> {
    return this.profiles.find(profile => profile.id === id);
  }

  async deleteById(id: string): Promise<void> {
    this.profiles = this.profiles.filter(profile => profile.id !== id);
  }

  async existsById(id: string): Promise<boolean> {
    return this.profiles.some(profile => profile.id === id);
  }

  async clear(): Promise<void> {
    this.profiles = [];
  }
}
