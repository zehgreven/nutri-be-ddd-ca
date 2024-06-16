import Profile from '@src/domain/entity/Profile';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import { inject } from '../dependency-injection/Registry';

export interface ProfileRepository {
  save(profile: Profile): Promise<void>;
  update(profile: Profile): Promise<void>;
  getById(id: string): Promise<Profile | undefined>;
  deleteById(id: string): Promise<void>;
  existsById(id: string): Promise<boolean>;
  listByAccountId(accountId: string): Promise<Profile[]>;
}

export class ProfileRepositoryPostgres implements ProfileRepository {
  @inject('DatabaseConnection')
  private connection!: DatabaseConnection;

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

  async listByAccountId(accountId: string): Promise<Profile[]> {
    const query = `
      select
        p.id,
        p.name,
        p.description,
        p.active
      from
        iam.profile p
      inner join
        iam.account_profile ap
          on ap.profile_id = p.id
      inner join
        iam.account a
          on a.id = ap.account_id
      where 1=1
        and p.deleted is null
        and ap.deleted is null
        and a.deleted is null
        and a.id = $(accountId)
    `;
    const profiles = await this.connection.query(query, { accountId });
    return profiles.map((profile: any) =>
      Profile.restore(profile.id, profile.name, profile.description, profile.active),
    );
  }
}
