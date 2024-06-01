import Account from '@src/domain/entity/Account';
import AccountProfile from '@src/domain/entity/AccountProfile';
import { AccountProfileRepository } from '@src/infra/repository/AccountProfileRepository';
import { AccountRepository } from '@src/infra/repository/AccountRepository';
import config from 'config';

export class SignUp {
  constructor(
    readonly accountRepository: AccountRepository,
    readonly accountProfileRepository: AccountProfileRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const account = Account.create(input.username, input.password);
    await this.accountRepository.save(account);

    const accountProfile = AccountProfile.create(account.id, config.get('default.profileId'));
    await this.accountProfileRepository.save(accountProfile);

    return {
      id: account.id,
    };
  }
}

type Input = {
  username: string;
  password: string;
};

type Output = {
  id: string;
};
