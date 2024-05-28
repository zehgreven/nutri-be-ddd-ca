import { ProfileNotFoundError } from '@src/domain/error/ProfileNotFoundError';
import { ProfileRepository } from '@src/infra/repository/ProfileRepository';

export class PatchProfile {
  constructor(readonly profileRepository: ProfileRepository) {}
  async execute(id: string, input: Input): Promise<void> {
    const profile = await this.profileRepository.getById(id);
    if (!profile) {
      throw new ProfileNotFoundError(`Unable to find profile with id=${id}`);
    }
    const patchInput = {
      name: input.name,
      description: input.description,
      active: input.active,
    };
    profile.patch(patchInput);
    await this.profileRepository.update(profile);
  }
}

type Input = {
  name?: string | null;
  description?: string | null;
  active?: boolean | null;
};
