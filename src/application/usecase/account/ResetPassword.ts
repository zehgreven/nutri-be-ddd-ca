import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import logger from '@src/infra/logging/logger';
import { Messaging } from '@src/infra/messaging/Messaging';
import { AccountRepository } from '@src/infra/repository/AccountRepository';

export class ResetPassword {
  constructor(
    readonly accountRepository: AccountRepository,
    readonly messaging: Messaging,
  ) {}

  async execute(id: string): Promise<void> {
    logger.info(`ResetPassword: resetting password for accountId=${id}`);
    const account = await this.accountRepository.getById(id);
    if (!account) {
      throw new AccountNotFoundError(`Unable to find account with id=${id}`);
    }
    account.resetPassword();
    await this.accountRepository.updatePassword(account);

    this.messaging.publish('iam.account.updated', {
      event: 'PASSWORD_RESETED',
      id: account.id,
    });
  }
}
