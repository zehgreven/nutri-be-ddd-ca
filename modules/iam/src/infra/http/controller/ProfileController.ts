import { GetProfileByIdQuery } from '@src/application/query/profile/GetProfileByIdQuery';
import { ListProfilePermissionQuery } from '@src/application/query/profile/ListProfilePermissionQuery';
import { ListProfileQuery } from '@src/application/query/profile/ListProfileQuery';
import { AssignProfilePermission } from '@src/application/usecase/profile/AssignProfilePermission';
import { CreateProfile } from '@src/application/usecase/profile/CreateProfile';
import { DeleteProfile } from '@src/application/usecase/profile/DeleteProfile';
import { GrantAndRevokeProfilePermission } from '@src/application/usecase/profile/GrantAndRevokeProfilePermission';
import { PatchProfile } from '@src/application/usecase/profile/PatchProfile';
import { UnassignProfilePermission } from '@src/application/usecase/profile/UnassignProfilePermission';
import { inject } from '@src/infra/dependency-injection/Registry';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';
import { AdminAuthorizationMiddleware } from '@src/infra/http/middleware/AdminAuthorizationMiddleware';
import AuthorizationMiddleware from '@src/infra/http/middleware/AuthorizationMiddleware';
import Cache from '@src/infra/http/middleware/Cache';

export class ProfileController {
  @inject('HttpServer')
  private httpServer!: HttpServer;

  @inject('AdminAuthorizationMiddleware')
  private adminAuthorizationMiddleware!: AdminAuthorizationMiddleware;

  @inject('CreateProfile')
  private createProfile!: CreateProfile;

  @inject('PatchProfile')
  private patchProfile!: PatchProfile;

  @inject('GetProfileByIdQuery')
  private getProfileById!: GetProfileByIdQuery;

  @inject('ListProfileQuery')
  private listProfile!: ListProfileQuery;

  @inject('DeleteProfile')
  private deleteProfile!: DeleteProfile;

  @inject('AssignProfilePermission')
  private assignPermission!: AssignProfilePermission;

  @inject('UnassignProfilePermission')
  private unassignPermission!: UnassignProfilePermission;

  @inject('GrantAndRevokeProfilePermission')
  private grantAndRevokePermission!: GrantAndRevokeProfilePermission;

  @inject('ListProfilePermissionQuery')
  private listProfilePermission!: ListProfilePermissionQuery;

  @inject('Cache')
  private cache!: Cache;

  constructor() {
    const adminAccess = (req: any, _: any, next: Function) => this.adminAuthorizationMiddleware.execute(req, _, next);
    const authorizedAccess = AuthorizationMiddleware;
    const cached = this.cache.middleware();

    this.httpServer.post('/profiles/v1', [authorizedAccess, adminAccess], this.executeCreateProfile);
    this.httpServer.get('/profiles/v1', [authorizedAccess, adminAccess, cached], this.executeListProfile);
    this.httpServer.get('/profiles/v1/permissions', [authorizedAccess, cached], this.executeListProfilePermission);
    this.httpServer.get('/profiles/v1/:profileId', [authorizedAccess, cached], this.executeGetProfileById);
    this.httpServer.patch('/profiles/v1/:profileId', [authorizedAccess, adminAccess], this.executePatchProfile);
    this.httpServer.delete('/profiles/v1/:profileId', [authorizedAccess, adminAccess], this.executeDeleteProfile);
    this.httpServer.post(
      '/profiles/v1/:profileId/functionality/:functionalityId',
      [authorizedAccess, adminAccess],
      this.executeAssignPermission,
    );
    this.httpServer.delete(
      '/profiles/v1/:profileId/functionality/:functionalityId',
      [authorizedAccess, adminAccess],
      this.executeUnassignPermission,
    );
    this.httpServer.patch(
      '/profiles/v1/:profileId/functionality/:functionalityId',
      [authorizedAccess, adminAccess],
      this.executeGrantAndRevokePermission,
    );
  }

  private executeCreateProfile: CallbackFunction = (_: any, body: any) => {
    return this.createProfile.execute(body);
  };

  private executePatchProfile: CallbackFunction = (params: any, body: any) => {
    return this.patchProfile.execute(params.profileId, body);
  };

  private executeGetProfileById: CallbackFunction = (params: any) => {
    return this.getProfileById.execute(params.profileId);
  };

  private executeDeleteProfile: CallbackFunction = (params: any) => {
    return this.deleteProfile.execute(params.profileId);
  };

  private executeListProfile: CallbackFunction = (params: any) => {
    if (!params.limit || params.limit < 1) {
      params.limit = 10;
    }
    if (!params.page || params.page < 1) {
      params.page = 1;
    }
    return this.listProfile.execute(params);
  };

  private executeAssignPermission: CallbackFunction = (params: any) => {
    return this.assignPermission.execute(params.profileId, params.functionalityId);
  };

  private executeUnassignPermission: CallbackFunction = (params: any) => {
    return this.unassignPermission.execute(params.profileId, params.functionalityId);
  };

  private executeGrantAndRevokePermission: CallbackFunction = (params: any) => {
    return this.grantAndRevokePermission.execute(params.profileId, params.functionalityId);
  };

  private executeListProfilePermission: CallbackFunction = (params: any) => {
    return this.listProfilePermission.execute(params);
  };
}
