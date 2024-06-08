import { ProfilePermissionRepository } from '@src/infra/repository/ProfilePermissionRepository';

export class UnassignPermission {
  constructor(readonly profilePermissionRepository: ProfilePermissionRepository) {}

  async execute(profileId: string, functionalityId: string): Promise<void> {
    await this.profilePermissionRepository.deleteByProfileIdAndFunctionalityId(profileId, functionalityId);
  }
}
