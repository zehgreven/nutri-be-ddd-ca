import Profile from '@src/domain/entity/Profile';
import { ProfileRepository } from '@src/infra/repository/ProfileRepository';

export class CreateProfile {
  constructor(readonly profileRepository: ProfileRepository) {}
  async execute(input: Input): Promise<Output> {
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
