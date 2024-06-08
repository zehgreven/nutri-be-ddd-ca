import { ProfilePermissionRepository } from '@src/infra/repository/ProfilePermissionRepository';

export class UnassignProfilePermission {
  constructor(readonly profilePermissionRepository: ProfilePermissionRepository) {}

  async execute(profileId: string, functionalityId: string): Promise<void> {
    await this.profilePermissionRepository.deleteByProfileIdAndFunctionalityId(profileId, functionalityId);
  }
}
