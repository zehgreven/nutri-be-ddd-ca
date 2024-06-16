import { UnauthorizedError } from '@src/domain/error/UnauthorizedError';
import config from 'config';
import jwt from 'jsonwebtoken';

export interface JwtToken {
  id: string;
  iat: number;
  exp: number;
}

const AuthorizationMiddleware = async (req: any, _: any, next: Function): Promise<void> => {
  if (!req.headers.authorization) {
    return next(new UnauthorizedError('Missing authorization headers'));
  }

  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return next(new UnauthorizedError('Invalid token'));
  }

  try {
    const decoded = jwt.verify(token, config.get<string>('auth.key')) as JwtToken;
    req.accountId = decoded.id;
  } catch (error: any) {
    return next(new UnauthorizedError(error.message));
  }

  next();
};

export default AuthorizationMiddleware;
