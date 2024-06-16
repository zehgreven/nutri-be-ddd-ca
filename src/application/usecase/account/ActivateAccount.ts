import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';
import { AccountRepository } from '@src/infra/repository/AccountRepository';

export class ActivateAccount {
  @inject('AccountRepository')
  private accountRepository!: AccountRepository;

  async execute(accountId: string): Promise<void> {
    logger.info(`ActivateAccount: activating account with id=${accountId}`);
    const account = await this.accountRepository.getById(accountId);
    if (!account) {
      throw new AccountNotFoundError(`Unable to find account with id=${accountId}`);
    }
    account.activate();
    await this.accountRepository.updateActive(account);
  }
}
