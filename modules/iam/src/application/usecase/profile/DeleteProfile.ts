import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';
import { ProfileRepository } from '@src/infra/repository/ProfileRepository';

export class DeleteProfile {
  @inject('ProfileRepository')
  private profileRepository!: ProfileRepository;

  async execute(profileId: string): Promise<void> {
    logger.info(`DeleteProfile: deleting profile with id=${profileId}`);
    await this.profileRepository.deleteById(profileId);
  }
}
