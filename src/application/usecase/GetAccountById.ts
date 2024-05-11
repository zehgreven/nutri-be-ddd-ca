import { AccountRepository } from '../../infra/repository/AccountRepository';
import { AccountNotFoundError } from '../../domain/error/AccountNotFoundError';

export class GetAccountById {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(id: string): Promise<Output> {
    const account = await this.accountRepository.getById(id);

    if (!account) {
      throw new AccountNotFoundError(`Unable to find account with id = ${id}`);
    }

    return {
      id: account.id,
      username: account.getUsername(),
      password: account.getPassword(),
    };
  }
}

type Output = {
  id: string;
  username: string;
  password: string;
};
