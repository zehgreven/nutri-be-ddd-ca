import AccountProfile from '@src/domain/entity/AccountProfile';
import { AccountProfileRepository } from '@src/infra/repository/AccountProfileRepository';

export class UnassignProfile {
  constructor(readonly accountProfileRepository: AccountProfileRepository) {}

  async execute(accountId: string, profileId: string): Promise<void> {
    await this.accountProfileRepository.deleteByAccountIdAndProfileId(accountId, profileId);
  }
}
