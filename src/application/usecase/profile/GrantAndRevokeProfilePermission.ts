import { PermissionNotFoundError } from '@src/domain/error/PermissionNotFoundError';
import { ProfilePermissionRepository } from '@src/infra/repository/ProfilePermissionRepository';

export class GrantAndRevokeProfilePermission {
  constructor(readonly profilePermissionRepository: ProfilePermissionRepository) {}

  async execute(profileId: string, functionalityId: string): Promise<void> {
    const permission = await this.profilePermissionRepository.getByProfileIdAndFunctionalityId(
      profileId,
      functionalityId,
    );
    if (!permission) {
      throw new PermissionNotFoundError(
        `Unable to find permissoin with profileId=${profileId} and functionalityId=${functionalityId}`,
      );
    }

    await this.profilePermissionRepository.updateAllowById(permission.id, !permission.allow);
  }
}
