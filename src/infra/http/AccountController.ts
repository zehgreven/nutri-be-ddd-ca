import { GetAccountByIdQuery } from '@src/application/query/account/GetAccountByIdQuery';
import { ListAccountPermissionQuery } from '@src/application/query/account/ListAccountPermissionQuery';
import { AssignAccountPermission } from '@src/application/usecase/account/AssignAccountPermission';
import { AssignProfile } from '@src/application/usecase/account/AssignProfile';
import { ChangePassword } from '@src/application/usecase/account/ChangePassword';
import { GrantAndRevokeAccountPermission } from '@src/application/usecase/account/GrantAndRevokeAccountPermission';
import { SignUp } from '@src/application/usecase/account/SignUp';
import { UnassignAccountPermission } from '@src/application/usecase/account/UnassignAccountPermission';
import { UnassignProfile } from '@src/application/usecase/account/UnassignProfile';
import { UnauthorizedError } from '@src/domain/error/UnauthorizedError';
import AuthorizationMiddleware from '@src/infra/http/AuthorizationMiddleware';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';

export class AccountController {
  constructor(
    readonly httpServer: HttpServer,
    readonly getAccountById: GetAccountByIdQuery,
    readonly signUp: SignUp,
    readonly changePassword: ChangePassword,
    readonly assignProfile: AssignProfile,
    readonly unassignProfile: UnassignProfile,
    readonly assignPermission: AssignAccountPermission,
    readonly unassignPermission: UnassignAccountPermission,
    readonly grantAndRevokePermission: GrantAndRevokeAccountPermission,
    readonly listPermission: ListAccountPermissionQuery,
  ) {
    httpServer.post('/accounts/v1', [], this.executeSignUp);
    httpServer.get('/accounts/v1/me', [AuthorizationMiddleware], this.executeGetAuthenticatedAccount);
    httpServer.get('/accounts/v1/permissions', [AuthorizationMiddleware], this.executeListPermission);
    httpServer.get('/accounts/v1/:accountId', [AuthorizationMiddleware], this.executeGetAccountById);
    httpServer.patch('/accounts/v1/password', [AuthorizationMiddleware], this.executeChangePassword);
    httpServer.post('/accounts/v1/:accountId/profile/:profileId', [AuthorizationMiddleware], this.executeAssignProfile);
    httpServer.delete(
      '/accounts/v1/:accountId/profile/:profileId',
      [AuthorizationMiddleware],
      this.executeUnassignProfile,
    );
    httpServer.post(
      '/accounts/v1/:accountId/functionality/:functionalityId',
      [AuthorizationMiddleware],
      this.executeAssignPermission,
    );
    httpServer.delete(
      '/accounts/v1/:accountId/functionality/:functionalityId',
      [AuthorizationMiddleware],
      this.executeUnassignPermission,
    );
    httpServer.patch(
      '/accounts/v1/:accountId/functionality/:functionalityId',
      [AuthorizationMiddleware],
      this.executeGrantAndRevokePermission,
    );
  }

  private executeGetAuthenticatedAccount: CallbackFunction = (_: any, __: any, accountId?: string) => {
    if (!accountId) {
      throw new UnauthorizedError('Invalid account id');
    }
    return this.getAccountById.execute(accountId);
  };

  private executeGetAccountById: CallbackFunction = (params: any) => {
    return this.getAccountById.execute(params.accountId);
  };

  private executeSignUp: CallbackFunction = (_: any, body: any) => {
    return this.signUp.execute(body);
  };

  private executeChangePassword: CallbackFunction = (_: any, body: any, accountId?: string) => {
    return this.changePassword.execute(body, accountId);
  };

  private executeAssignProfile: CallbackFunction = (params: any) => {
    return this.assignProfile.execute(params.accountId, params.profileId);
  };

  private executeUnassignProfile: CallbackFunction = (params: any) => {
    return this.unassignProfile.execute(params.accountId, params.profileId);
  };

  private executeAssignPermission: CallbackFunction = (params: any) => {
    return this.assignPermission.execute(params.accountId, params.functionalityId);
  };

  private executeUnassignPermission: CallbackFunction = (params: any) => {
    return this.unassignPermission.execute(params.accountId, params.functionalityId);
  };

  private executeGrantAndRevokePermission: CallbackFunction = (params: any) => {
    return this.grantAndRevokePermission.execute(params.accountId, params.functionalityId);
  };

  private executeListPermission: CallbackFunction = (params: any) => {
    return this.listPermission.execute(params);
  };
}
