import ProfilePermission from '@src/domain/entity/ProfilePermission';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';

export interface ProfilePermissionRepository {
  save(permission: ProfilePermission): Promise<void>;
  deleteByProfileIdAndFunctionalityId(profileId: string, functionalityId: string): Promise<void>;
  getByProfileIdAndFunctionalityId(profileId: string, functionalityId: string): Promise<ProfilePermission | undefined>;
  updateAllowById(id: string, allow: boolean): Promise<void>;
}

export class ProfilePermissionRepositoryPostgres implements ProfilePermissionRepository {
  constructor(private connection: DatabaseConnection) {}

  async save(permission: ProfilePermission): Promise<void> {
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

  async getByProfileIdAndFunctionalityId(
    profileId: string,
    functionalityId: string,
  ): Promise<ProfilePermission | undefined> {
    const query = `
      select
        id,
        active,
        allow,
        profile_id as "profileId",
        functionality_id as "functionalityId"
      from
        iam.profile_permission
      where 1=1
        and deleted is null
        and profile_id = $(profileId)
        and functionality_id = $(functionalityId)
    `;
    const [permission] = await this.connection.query(query, { profileId, functionalityId });
    if (!permission) {
      return;
    }
    return ProfilePermission.restore(
      permission.id,
      permission.profileId,
      permission.functionalityId,
      permission.allow,
      permission.active,
    );
  }

  async updateAllowById(id: string, allow: boolean): Promise<void> {
    const query = `
      update iam.profile_permission
      set allow = $(allow)
      where id = $(id)
    `;
    await this.connection.query(query, { id, allow });
  }
}
