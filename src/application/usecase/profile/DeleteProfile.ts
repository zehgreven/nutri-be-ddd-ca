import logger from '@src/infra/logging/logger';
import { ProfileRepository } from '@src/infra/repository/ProfileRepository';

export class DeleteProfile {
  constructor(readonly profileRepository: ProfileRepository) {}

  async execute(profileId: string): Promise<void> {
    logger.info(`DeleteProfile: deleting profile with id=${profileId}`);
    await this.profileRepository.deleteById(profileId);
  }
}
