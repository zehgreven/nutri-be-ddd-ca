import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';
import { ProfilePermissionRepository } from '@src/infra/repository/ProfilePermissionRepository';

export class UnassignProfilePermission {
  @inject('ProfilePermissionRepository')
  private profilePermissionRepository!: ProfilePermissionRepository;

  async execute(profileId: string, functionalityId: string): Promise<void> {
    logger.info(
      `UnassignProfilePermission: unassigning permission for profileId=${profileId} and functionalityId=${functionalityId}`,
    );
    await this.profilePermissionRepository.deleteByProfileIdAndFunctionalityId(profileId, functionalityId);
  }
}
