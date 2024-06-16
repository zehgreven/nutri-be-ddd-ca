import { IncorrectCredentialsError } from '@src/domain/error/IncorrectCredentialsError';
import { InvalidTokenError } from '@src/domain/error/InvalidTokenError';
import { inject } from '@src/infra/dependency-injection/Registry';
import { JwtToken } from '@src/infra/http/middleware/AuthorizationMiddleware';
import logger from '@src/infra/logging/logger';
import { AccountRepository } from '@src/infra/repository/AccountRepository';
import config from 'config';
import jwt from 'jsonwebtoken';

export class RefreshToken {
  @inject('AccountRepository')
  private accountRepository!: AccountRepository;

  async execute(input?: Input): Promise<Output> {
    if (!input?.token) {
      throw new InvalidTokenError('Missing refresh token');
    }

    const tokenKey = config.get<string>('auth.key');

    const { id } = jwt.verify(input.token, tokenKey) as JwtToken;
    if (!id) {
      throw new InvalidTokenError('Invalid refresh token');
    }

    const account = await this.accountRepository.existsById(id);
    if (!account) {
      throw new IncorrectCredentialsError('Your credentials are incorrect');
    }

    logger.info(`RefreshToken: refreshing token for accountId=${id}`);
    const tokenExpiration = config.get<string>('auth.expiration');
    const token = jwt.sign({ id }, tokenKey, { expiresIn: tokenExpiration });

    const refreshTokenExpiration = config.get<string>('auth.refreshTokenExpiration');
    const refreshToken = jwt.sign({ id }, tokenKey, { expiresIn: refreshTokenExpiration });

    return {
      token,
      refreshToken,
    };
  }
}

type Input = {
  token: string;
};

type Output = {
  token: string;
  refreshToken: string;
};
