import Account from '@src/domain/entity/Account';
import AccountProfile from '@src/domain/entity/AccountProfile';
import { inject } from '@src/infra/dependency-injection/Registry';
import logger from '@src/infra/logging/logger';
import { Messaging } from '@src/infra/messaging/Messaging';
import { AccountProfileRepository } from '@src/infra/repository/AccountProfileRepository';
import { AccountRepository } from '@src/infra/repository/AccountRepository';
import config from 'config';

export class SignUp {
  @inject('AccountRepository')
  private accountRepository!: AccountRepository;

  @inject('AccountProfileRepository')
  private accountProfileRepository!: AccountProfileRepository;

  @inject('Messaging')
  private messaging!: Messaging;

  async execute(input: Input): Promise<Output> {
    logger.info(`SignUp: creating account for username=${input.username}`);
    const account = Account.create(input.username, input.password);
    await this.accountRepository.save(account);

    logger.info(`SignUp: creating default profile for username=${input.username}`);
    const accountProfile = AccountProfile.create(account.id, config.get('default.profileId'));
    await this.accountProfileRepository.save(accountProfile);

    const result = {
      id: account.id,
    };

    this.messaging.publish('iam.account.created', result);
    return result;
  }
}

type Input = {
  username: string;
  password: string;
};

type Output = {
  id: string;
};
