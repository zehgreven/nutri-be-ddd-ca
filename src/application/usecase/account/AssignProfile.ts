import AccountProfile from '@src/domain/entity/AccountProfile';
import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import { ProfileNotFoundError } from '@src/domain/error/ProfileNotFoundError';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';
import { AccountProfileRepository } from '@src/infra/repository/AccountProfileRepository';
import { AccountRepository } from '@src/infra/repository/AccountRepository';
import { ProfileRepository } from '@src/infra/repository/ProfileRepository';

export class AssignProfile {
  @inject('ProfileRepository')
  private profileRepository!: ProfileRepository;
  @inject('AccountRepository')
  private accountRepository!: AccountRepository;
  @inject('AccountProfileRepository')
  private accountProfileRepository!: AccountProfileRepository;

  async execute(accountId: string, profileId: string): Promise<void> {
    logger.info(`AssignProfile: assigning profileId=${profileId} to accountId=${accountId}`);
    const account = await this.accountRepository.getById(accountId);
    if (!account) {
      throw new AccountNotFoundError(`Unable to find account with id=${accountId}`);
    }

    const profile = await this.profileRepository.getById(profileId);
    if (!profile) {
      throw new ProfileNotFoundError(`Unable to find profile with id=${profileId}`);
    }

    const accountProfile = AccountProfile.create(account.id, profile.id);

    await this.accountProfileRepository.save(accountProfile);
  }
}
