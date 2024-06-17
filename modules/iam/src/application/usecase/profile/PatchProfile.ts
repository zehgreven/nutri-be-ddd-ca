import { ProfileNotFoundError } from '@src/domain/error/ProfileNotFoundError';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';
import { ProfileRepository } from '@src/infra/repository/ProfileRepository';

export class PatchProfile {
  @inject('ProfileRepository')
  private profileRepository!: ProfileRepository;
  async execute(id: string, input: Input): Promise<void> {
    logger.info(`PatchProfile: patching profile with id=${id} with input=${JSON.stringify(input)}`);
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
