import ProfilePermission from '@src/domain/entity/ProfilePermission';
import { FunctionalityNotFoundError } from '@src/domain/error/FunctionalityNotFoundError';
import { ProfileNotFoundError } from '@src/domain/error/ProfileNotFoundError';
import { FunctionalityRepository } from '@src/infra/repository/FunctionalityRepository';
import { ProfilePermissionRepository } from '@src/infra/repository/ProfilePermissionRepository';
import { ProfileRepository } from '@src/infra/repository/ProfileRepository';

export class AssignProfilePermission {
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

    const permission = ProfilePermission.create(profileId, functionalityId);
    await this.profilePermissionRepository.save(permission);
  }
}
