import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AccountRepository } from '../../infra/repository/AccountRepository';
import Account from '../../domain/entity/Account';
import { AccountNotFoundError } from '../../domain/error/AccountNotFoundError';
import { IncorrectCredentialsError as IncorrectCredentialsError } from '../../domain/error/IncorrectCredentialsError';

export class SignIn {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input): Promise<Output> {
    const account = await this.accountRepository.getByUsername(input.username);

    if (!account) {
      throw new AccountNotFoundError(`Unable to find account for username=${input.username}`);
    }

    if (!this.isPasswordCorrect(input, account)) {
      throw new IncorrectCredentialsError('Your credentials are incorrect');
    }

    const token = jwt.sign({ id: account.id }, 'secret', { expiresIn: '1h' });

    return {
      token,
    };
  }

  private isPasswordCorrect(input: Input, account: Account) {
    return bcrypt.compareSync(input.password, account.getPassword());
  }
}

type Input = {
  username: string;
  password: string;
};

type Output = {
  token: string;
};
