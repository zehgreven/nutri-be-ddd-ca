import { PermissionNotFoundError } from '@src/domain/error/PermissionNotFoundError';
import logger from '@src/infra/logging/logger';
import { ProfilePermissionRepository } from '@src/infra/repository/ProfilePermissionRepository';

export class GrantAndRevokeProfilePermission {
  constructor(readonly profilePermissionRepository: ProfilePermissionRepository) {}

  async execute(profileId: string, functionalityId: string): Promise<void> {
    logger.info(
      `GrantAndRevokeProfilePermission: granting or revoking permission for profileId=${profileId} and functionalityId=${functionalityId}`,
    );
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
