import { GetAccountById } from '../../application/usecase/GetAccountById';
import { SignUp } from '../../application/usecase/SignUp';
import { UnauthorizedError } from '../../domain/error/UnauthorizedError';
import AuthorizationMiddleware from './AuthorizationMiddleware';
import httpServer, { CallbackFunction } from './HttpServer';

export class AccountController {
  constructor(
    readonly httpServer: httpServer,
    readonly getAccountById: GetAccountById,
    readonly signUp: SignUp,
  ) {
    httpServer.get('/accounts/v1/me', [AuthorizationMiddleware], this.executeGetAuthenticatedAccount);
    httpServer.get('/accounts/v1/:accountId', [AuthorizationMiddleware], this.executeGetAccountById);
    httpServer.post('/accounts/v1', [], this.executeSignUp);
  }

  private executeGetAuthenticatedAccount: CallbackFunction = (_: any, __: any, accountId?: string) => {
    if (!accountId) {
      throw new UnauthorizedError('Invalid account id');
    }
    return this.getAccountById.execute(accountId);
  };

  private executeGetAccountById: CallbackFunction = (params: any) => {
    const accountId = params.accountId;
    return this.getAccountById.execute(accountId);
  };

  private executeSignUp: CallbackFunction = (_: any, body: any) => {
    return this.signUp.execute(body);
  };
}
