import { InvalidTokenError } from '@src/domain/error/InvalidTokenError';
import { JwtToken } from '@src/infra/http/AuthorizationMiddleware';
import config from 'config';
import jwt from 'jsonwebtoken';

export class RefreshToken {
  constructor() {}

  async execute(input?: Input): Promise<Output> {
    if (!input?.token) {
      throw new InvalidTokenError('Missing refresh token');
    }

    const tokenKey = config.get<string>('auth.key');

    const { id } = jwt.verify(input.token, tokenKey) as JwtToken;
    if (!id) {
      throw new InvalidTokenError('Invalid refresh token');
    }

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
