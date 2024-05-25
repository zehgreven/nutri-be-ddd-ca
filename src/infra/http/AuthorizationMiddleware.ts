import { UnauthorizedError } from '@src/domain/error/UnauthorizedError';
import { MiddlewareFunction } from '@src/infra/http/HttpServer';
import config from 'config';
import jwt from 'jsonwebtoken';

export interface JwtToken {
  id: string;
  iat: number;
  exp: number;
}

const AuthorizationMiddleware: MiddlewareFunction = async (req: any): Promise<void> => {
  if (!req.headers.authorization) {
    throw new UnauthorizedError('Missing authorization headers');
  }

  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    throw new UnauthorizedError('Invalid token');
  }

  try {
    const decoded = jwt.verify(token, config.get<string>('auth.key')) as JwtToken;
    req.accountId = decoded.id;
  } catch (error: any) {
    throw new UnauthorizedError(error.message);
  }
};

export default AuthorizationMiddleware;
