import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import { AccountRepository } from '@src/infra/repository/AccountRepository';

export class DeactivateAccount {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(accountId: string): Promise<void> {
    const account = await this.accountRepository.getById(accountId);
    if (!account) {
      throw new AccountNotFoundError(`Unable to find account with id=${accountId}`);
    }
    account.deactivate();
    await this.accountRepository.updateActive(account);
  }
}
