import logger from '@src/infra/logging/logger';
import { AccountRepository } from '@src/infra/repository/AccountRepository';

export class DeleteAccount {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(accountId: string): Promise<void> {
    logger.info(`DeleteAccount: deleting account with id=${accountId}`);
    await this.accountRepository.deleteById(accountId);
  }
}
