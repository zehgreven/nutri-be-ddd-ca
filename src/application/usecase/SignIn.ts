import { IncorrectCredentialsError } from '@src/domain/error/IncorrectCredentialsError';
import { AccountRepository } from '@src/infra/repository/AccountRepository';
import config from 'config';
import jwt from 'jsonwebtoken';

export class SignIn {
  constructor(readonly accountRepository: AccountRepository) {}

  async execute(input: Input): Promise<Output> {
    const account = await this.accountRepository.getByUsername(input.username);
    if (!account || !account.isSamePassword(input.password)) {
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
}

type Input = {
  username: string;
  password: string;
};

type Output = {
  token: string;
  refreshToken: string;
};
