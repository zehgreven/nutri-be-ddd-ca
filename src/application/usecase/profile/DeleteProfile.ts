import { ProfileRepository } from '@src/infra/repository/ProfileRepository';

export class DeleteProfile {
  constructor(readonly profileRepository: ProfileRepository) {}

  async execute(profileId: string): Promise<void> {
    await this.profileRepository.deleteById(profileId);
  }
}
