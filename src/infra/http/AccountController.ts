import { GetAccountByIdQuery } from '@src/application/query/GetAccountByIdQuery';
import { ChangePassword } from '@src/application/usecase/ChangePassword';
import { SignUp } from '@src/application/usecase/SignUp';
import { UnauthorizedError } from '@src/domain/error/UnauthorizedError';
import AuthorizationMiddleware from '@src/infra/http/AuthorizationMiddleware';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';

export class AccountController {
  constructor(
    readonly httpServer: HttpServer,
    readonly getAccountById: GetAccountByIdQuery,
    readonly signUp: SignUp,
    readonly changePassword: ChangePassword,
  ) {
    httpServer.post('/accounts/v1', [], this.executeSignUp);
    httpServer.get('/accounts/v1/me', [AuthorizationMiddleware], this.executeGetAuthenticatedAccount);
    httpServer.get('/accounts/v1/:accountId', [AuthorizationMiddleware], this.executeGetAccountById);
    httpServer.patch('/accounts/v1/password', [AuthorizationMiddleware], this.executeChangePassword);
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

  private executeChangePassword: CallbackFunction = (_: any, body: any, accountId?: string) => {
    return this.changePassword.execute(body, accountId);
  };
}
