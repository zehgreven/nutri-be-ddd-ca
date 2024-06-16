import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import { PasswordCreationError } from '@src/domain/error/PasswordCreationError';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';
import { Messaging } from '@src/infra/messaging/Messaging';
import { AccountRepository } from '@src/infra/repository/AccountRepository';

export class ChangePassword {
  @inject('AccountRepository')
  private accountRepository!: AccountRepository;

  @inject('Messaging')
  private messaging!: Messaging;

  async execute(input: Input, accountId?: string) {
    logger.info(`ChangePassword: changing password for accountId=${accountId}`);
    if (!accountId) {
      throw new AccountNotFoundError('Account not found');
    }
    const account = await this.accountRepository.getById(accountId);
    if (!account) {
      throw new AccountNotFoundError('Account not found');
    }
    if (!account.isSamePassword(input.oldPassword)) {
      throw new PasswordCreationError('Old password is not correct');
    }
    account.changePassword(input.newPassword);
    await this.accountRepository.updatePassword(account);

    this.messaging.publish('iam.account.updated', {
      event: 'PASSWORD_CHANGED',
      id: account.id,
    });

    return {
      id: account.id,
      username: account.getUsername(),
      password: account.getPassword(),
    };
  }
}

type Input = {
  oldPassword: string;
  newPassword: string;
};
