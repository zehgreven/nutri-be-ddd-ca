import Profile from '@src/domain/entity/Profile';
import logger from '@src/infra/logging/logger';
import { ProfileRepository } from '@src/infra/repository/ProfileRepository';

export class CreateProfile {
  constructor(readonly profileRepository: ProfileRepository) {}
  async execute(input: Input): Promise<Output> {
    logger.info(`CreateProfile: creating profile with input=${JSON.stringify(input)}`);
    const profile = Profile.create(input.name, input.description);
    await this.profileRepository.save(profile);
    return {
      id: profile.id,
    };
  }
}

type Input = {
  name: string;
  description: string;
};

type Output = {
  id: string;
};
