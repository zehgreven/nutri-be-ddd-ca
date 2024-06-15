import { GetAccountByIdQuery } from '@src/application/query/account/GetAccountByIdQuery';
import { ListAccountPermissionQuery } from '@src/application/query/account/ListAccountPermissionQuery';
import { ActivateAccount } from '@src/application/usecase/account/ActivateAccount';
import { AssignAccountPermission } from '@src/application/usecase/account/AssignAccountPermission';
import { AssignProfile } from '@src/application/usecase/account/AssignProfile';
import { ChangePassword } from '@src/application/usecase/account/ChangePassword';
import { DeactivateAccount } from '@src/application/usecase/account/DeactivateAccount';
import { DeleteAccount } from '@src/application/usecase/account/DeleteAccount';
import { GrantAndRevokeAccountPermission } from '@src/application/usecase/account/GrantAndRevokeAccountPermission';
import { ResetPassword } from '@src/application/usecase/account/ResetPassword';
import { SignUp } from '@src/application/usecase/account/SignUp';
import { UnassignAccountPermission } from '@src/application/usecase/account/UnassignAccountPermission';
import { UnassignProfile } from '@src/application/usecase/account/UnassignProfile';
import { UnauthorizedError } from '@src/domain/error/UnauthorizedError';
import AuthorizationMiddleware from '@src/infra/http/AuthorizationMiddleware';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';
import { AdminAuthorizationMiddleware } from './AdminAuthorizationMiddleware';

export class AccountController {
  constructor(
    readonly httpServer: HttpServer,
    readonly adminAuthorizationMiddleware: AdminAuthorizationMiddleware,
    readonly getAccountById: GetAccountByIdQuery,
    readonly signUp: SignUp,
    readonly changePassword: ChangePassword,
    readonly assignProfile: AssignProfile,
    readonly unassignProfile: UnassignProfile,
    readonly assignPermission: AssignAccountPermission,
    readonly unassignPermission: UnassignAccountPermission,
    readonly grantAndRevokePermission: GrantAndRevokeAccountPermission,
    readonly listPermission: ListAccountPermissionQuery,
    readonly deleteAccount: DeleteAccount,
    readonly activateAccount: ActivateAccount,
    readonly deactivateAccount: DeactivateAccount,
    readonly resetPassword: ResetPassword,
  ) {
    const adminAccess = [
      AuthorizationMiddleware,
      (req: any, res: any) => adminAuthorizationMiddleware.execute(req, res),
    ];
    const authorizedAccess = [AuthorizationMiddleware];
    httpServer.post('/accounts/v1', [], this.executeSignUp);
    httpServer.get('/accounts/v1/me', authorizedAccess, this.executeGetAuthenticatedAccount);
    httpServer.get('/accounts/v1/permissions', authorizedAccess, this.executeListPermission);
    httpServer.get('/accounts/v1/:accountId', adminAccess, this.executeGetAccountById);
    httpServer.patch('/accounts/v1/password', authorizedAccess, this.executeChangePassword);
    httpServer.patch('/accounts/v1/:accountId/activate', adminAccess, this.executeAcitivateAccount);
    httpServer.patch('/accounts/v1/:accountId/deactivate', adminAccess, this.executeDeactivateAccount);
    httpServer.patch('/accounts/v1/:accountId/reset-password', adminAccess, this.executeResetPassword);
    httpServer.post('/accounts/v1/:accountId/profile/:profileId', adminAccess, this.executeAssignProfile);
    httpServer.delete('/accounts/v1/:accountId/profile/:profileId', adminAccess, this.executeUnassignProfile);
    httpServer.post(
      '/accounts/v1/:accountId/functionality/:functionalityId',
      adminAccess,
      this.executeAssignPermission,
    );
    httpServer.delete(
      '/accounts/v1/:accountId/functionality/:functionalityId',
      adminAccess,
      this.executeUnassignPermission,
    );
    httpServer.patch(
      '/accounts/v1/:accountId/functionality/:functionalityId',
      adminAccess,
      this.executeGrantAndRevokePermission,
    );
    httpServer.delete('/accounts/v1/me', authorizedAccess, this.executeDeleteAuthenticatedAccount);
    httpServer.delete('/accounts/v1/:accountId', adminAccess, this.executeDeleteAccount);
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

  private executeDeleteAuthenticatedAccount: CallbackFunction = (_: any, __: any, accountId?: string) => {
    if (!accountId) {
      throw new UnauthorizedError('Invalid account id');
    }
    return this.deleteAccount.execute(accountId);
  };

  private executeDeleteAccount: CallbackFunction = (params: any) => {
    return this.deleteAccount.execute(params.accountId);
  };

  private executeAcitivateAccount: CallbackFunction = (params: any) => {
    return this.activateAccount.execute(params.accountId);
  };

  private executeDeactivateAccount: CallbackFunction = (params: any) => {
    return this.deactivateAccount.execute(params.accountId);
  };

  private executeResetPassword: CallbackFunction = (params: any) => {
    return this.resetPassword.execute(params.accountId);
  };
}
