import { AccountRepository } from '../../infra/repository/AccountRepository';

export class GetAccountById {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(id: string): Promise<Output> {
    const account = await this.accountRepository.getById(id);

    if (!account) {
      throw new Error(`Unable to find account with id = ${id}`);
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
