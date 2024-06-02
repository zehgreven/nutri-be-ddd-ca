import logger from '@src/infra/logging/logger';
import { AccountProfileRepository } from '@src/infra/repository/AccountProfileRepository';

export class UnassignProfile {
  constructor(readonly accountProfileRepository: AccountProfileRepository) {}

  async execute(accountId: string, profileId: string): Promise<void> {
    logger.info(`UnassignProfile: unassigning profileId=${profileId} from accountId=${accountId}`);
    await this.accountProfileRepository.deleteByAccountIdAndProfileId(accountId, profileId);
  }
}
