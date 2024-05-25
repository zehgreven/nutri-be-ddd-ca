import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import { PasswordCreationError } from '@src/domain/error/PasswordCreationError';
import { AccountRepository } from '@src/infra/repository/AccountRepository';

export class ChangePassword {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input, accountId?: string) {
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
