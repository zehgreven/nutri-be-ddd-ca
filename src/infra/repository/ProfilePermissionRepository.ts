import Permission from '@src/domain/entity/Permission';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';

export interface ProfilePermissionRepository {
  save(permission: Permission): Promise<void>;
  deleteByProfileIdAndFunctionalityId(profileId: string, functionalityId: string): Promise<void>;
}

export class ProfilePermissionRepositoryPostgres implements ProfilePermissionRepository {
  constructor(private connection: DatabaseConnection) {}

  async save(permission: Permission): Promise<void> {
    const query = `
      insert into iam.profile_permission (
        id,
        active,
        allow,
        profile_id,
        functionality_id
      ) values (
        $(id),
        $(active),
        $(allow),
        $(profileId),
        $(functionalityId)
      )
    `;

    await this.connection.query(query, permission);
  }

  async deleteByProfileIdAndFunctionalityId(profileId: string, functionalityId: string): Promise<void> {
    const query = `
      update iam.profile_permission 
      set deleted = now()
      where profile_id = $(profileId) 
      and functionality_id = $(functionalityId) 
      and deleted is null
    `;
    await this.connection.query(query, { profileId, functionalityId });
  }
}
