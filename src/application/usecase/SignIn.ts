import bcrypt from 'bcrypt';
import config from 'config';
import jwt from 'jsonwebtoken';
import Account from '../../domain/entity/Account';
import { IncorrectCredentialsError } from '../../domain/error/IncorrectCredentialsError';
import { AccountRepository } from '../../infra/repository/AccountRepository';

export class SignIn {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input): Promise<Output> {
    const account = await this.accountRepository.getByUsername(input.username);
    if (!account || !this.isPasswordCorrect(input, account)) {
      throw new IncorrectCredentialsError('Your credentials are incorrect');
    }

    const tokenKey = config.get<string>('auth.key');

    const tokenExpiration = config.get<string>('auth.expiration');
    const token = jwt.sign({ id: account.id }, tokenKey, { expiresIn: tokenExpiration });

    const refreshTokenExpiration = config.get<string>('auth.refreshTokenExpiration');
    const refreshToken = jwt.sign({ id: account.id }, tokenKey, { expiresIn: refreshTokenExpiration });

    return {
      token,
      refreshToken,
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
  refreshToken: string;
};
