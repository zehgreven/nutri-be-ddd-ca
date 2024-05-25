import Account from '@src/domain/entity/Account';
import { AccountRepository } from '@src/infra/repository/AccountRepository';

export class SignUp {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input): Promise<Output> {
    const account = this.toAccount(input);
    await this.accountRepository.save(account);
    return {
      id: account.id,
    };
  }

  private toAccount({ username, password }: Input): Account {
    return Account.create(username, password);
  }
}

type Input = {
  username: string;
  password: string;
};

type Output = {
  id: string;
};
