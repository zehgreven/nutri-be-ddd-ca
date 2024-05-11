import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AccountRepository } from '../../infra/repository/AccountRepository';
import Account from '../../domain/entity/Account';

export class SignIn {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input): Promise<Output> {
    const account = await this.accountRepository.getByUsername(input.username);

    if (!account) {
      throw new Error(`Unable to find account for username=${input.username}`);
    }

    if (!this.isPasswordCorrect(input, account)) {
      throw new Error('Invalid password');
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
