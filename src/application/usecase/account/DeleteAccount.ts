import { AccountRepository } from '@src/infra/repository/AccountRepository';

export class DeleteAccount {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(accountId: string): Promise<void> {
    await this.accountRepository.deleteById(accountId);
  }
}
