import Permission from '@src/domain/entity/Permission';
import { FunctionalityNotFoundError } from '@src/domain/error/FunctionalityNotFoundError';
import { ProfileNotFoundError } from '@src/domain/error/ProfileNotFoundError';
import { FunctionalityRepository } from '@src/infra/repository/FunctionalityRepository';
import { ProfilePermissionRepository } from '@src/infra/repository/ProfilePermissionRepository';
import { ProfileRepository } from '@src/infra/repository/ProfileRepository';

export class AssignPermission {
  constructor(
    readonly profileRepository: ProfileRepository,
    readonly functionalityRepository: FunctionalityRepository,
    readonly profilePermissionRepository: ProfilePermissionRepository,
  ) {}

  async execute(profileId: string, functionalityId: string): Promise<void> {
    const profile = await this.profileRepository.existsById(profileId);
    if (!profile) {
      throw new ProfileNotFoundError(`Unable to find profile with id=${profileId}`);
    }

    const functionality = await this.functionalityRepository.existsById(functionalityId);
    if (!functionality) {
      throw new FunctionalityNotFoundError(`Unable to find functionality with id=${functionalityId}`);
    }

    const permission = Permission.create(profileId, functionalityId);
    await this.profilePermissionRepository.save(permission);
  }
}
