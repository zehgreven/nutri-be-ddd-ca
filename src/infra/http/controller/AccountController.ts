import { GetAccountByIdQuery } from '@src/application/query/account/GetAccountByIdQuery';
import { ListAccountPermissionQuery } from '@src/application/query/account/ListAccountPermissionQuery';
import { ListAccountQuery } from '@src/application/query/account/ListAccountQuery';
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
import { inject } from '@src/infra/dependency-injection/Registry';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';
import { AdminAuthorizationMiddleware } from '@src/infra/http/middleware/AdminAuthorizationMiddleware';
import AuthorizationMiddleware from '@src/infra/http/middleware/AuthorizationMiddleware';
import Cache from '../middleware/Cache';

export class AccountController {
  @inject('HttpServer')
  private httpServer!: HttpServer;

  @inject('AdminAuthorizationMiddleware')
  private adminAuthorizationMiddleware!: AdminAuthorizationMiddleware;

  @inject('GetAccountByIdQuery')
  private getAccountById!: GetAccountByIdQuery;

  @inject('ListAccountQuery')
  private listAccount!: ListAccountQuery;

  @inject('SignUp')
  private signUp!: SignUp;

  @inject('ChangePassword')
  private changePassword!: ChangePassword;

  @inject('AssignProfile')
  private assignProfile!: AssignProfile;

  @inject('UnassignProfile')
  private unassignProfile!: UnassignProfile;

  @inject('AssignAccountPermission')
  private assignPermission!: AssignAccountPermission;

  @inject('UnassignAccountPermission')
  private unassignPermission!: UnassignAccountPermission;

  @inject('GrantAndRevokeAccountPermission')
  private grantAndRevokePermission!: GrantAndRevokeAccountPermission;

  @inject('ListAccountPermissionQuery')
  private listPermission!: ListAccountPermissionQuery;

  @inject('DeleteAccount')
  private deleteAccount!: DeleteAccount;

  @inject('ActivateAccount')
  private activateAccount!: ActivateAccount;

  @inject('DeactivateAccount')
  private deactivateAccount!: DeactivateAccount;

  @inject('ResetPassword')
  private resetPassword!: ResetPassword;

  @inject('Cache')
  private cache!: Cache;

  constructor() {
    const adminAccess = (req: any, _: any, next: Function) => this.adminAuthorizationMiddleware.execute(req, _, next);
    const authorizedAccess = AuthorizationMiddleware;
    const cached = this.cache.middleware();

    this.httpServer.post('/accounts/v1', [], this.executeSignUp);
    this.httpServer.get('/accounts/v1', [authorizedAccess, adminAccess, cached], this.executeListAccount);
    this.httpServer.get('/accounts/v1/me', [authorizedAccess, cached], this.executeGetAuthenticatedAccount);
    this.httpServer.get('/accounts/v1/permissions', [authorizedAccess, cached], this.executeListPermission);
    this.httpServer.get('/accounts/v1/:accountId', [authorizedAccess, adminAccess, cached], this.executeGetAccountById);
    this.httpServer.patch('/accounts/v1/password', [authorizedAccess], this.executeChangePassword);
    this.httpServer.patch(
      '/accounts/v1/:accountId/activate',
      [authorizedAccess, adminAccess],
      this.executeAcitivateAccount,
    );
    this.httpServer.patch(
      '/accounts/v1/:accountId/deactivate',
      [authorizedAccess, adminAccess],
      this.executeDeactivateAccount,
    );
    this.httpServer.patch(
      '/accounts/v1/:accountId/reset-password',
      [authorizedAccess, adminAccess],
      this.executeResetPassword,
    );
    this.httpServer.post(
      '/accounts/v1/:accountId/profile/:profileId',
      [authorizedAccess, adminAccess],
      this.executeAssignProfile,
    );
    this.httpServer.delete(
      '/accounts/v1/:accountId/profile/:profileId',
      [authorizedAccess, adminAccess],
      this.executeUnassignProfile,
    );
    this.httpServer.post(
      '/accounts/v1/:accountId/functionality/:functionalityId',
      [authorizedAccess, adminAccess],
      this.executeAssignPermission,
    );
    this.httpServer.delete(
      '/accounts/v1/:accountId/functionality/:functionalityId',
      [authorizedAccess, adminAccess],
      this.executeUnassignPermission,
    );
    this.httpServer.patch(
      '/accounts/v1/:accountId/functionality/:functionalityId',
      [authorizedAccess, adminAccess],
      this.executeGrantAndRevokePermission,
    );
    this.httpServer.delete('/accounts/v1/me', [authorizedAccess], this.executeDeleteAuthenticatedAccount);
    this.httpServer.delete('/accounts/v1/:accountId', [authorizedAccess, adminAccess], this.executeDeleteAccount);
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

  private executeListAccount: CallbackFunction = (params: any) => {
    if (!params.limit || params.limit < 1) {
      params.limit = 10;
    }
    if (!params.page || params.page < 1) {
      params.page = 1;
    }
    return this.listAccount.execute(params);
  };
}
