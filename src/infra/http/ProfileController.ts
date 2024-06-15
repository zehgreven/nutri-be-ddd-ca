import { GetProfileByIdQuery } from '@src/application/query/profile/GetProfileByIdQuery';
import { ListProfilePermissionQuery } from '@src/application/query/profile/ListProfilePermissionQuery';
import { ListProfileQuery } from '@src/application/query/profile/ListProfileQuery';
import { AssignProfilePermission } from '@src/application/usecase/profile/AssignProfilePermission';
import { CreateProfile } from '@src/application/usecase/profile/CreateProfile';
import { DeleteProfile } from '@src/application/usecase/profile/DeleteProfile';
import { GrantAndRevokeProfilePermission } from '@src/application/usecase/profile/GrantAndRevokeProfilePermission';
import { PatchProfile } from '@src/application/usecase/profile/PatchProfile';
import { UnassignProfilePermission } from '@src/application/usecase/profile/UnassignProfilePermission';
import AuthorizationMiddleware from '@src/infra/http/AuthorizationMiddleware';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';
import { AdminAuthorizationMiddleware } from './AdminAuthorizationMiddleware';

export class ProfileController {
  constructor(
    readonly httpServer: HttpServer,
    readonly adminAuthorizationMiddleware: AdminAuthorizationMiddleware,
    readonly createProfile: CreateProfile,
    readonly patchProfile: PatchProfile,
    readonly getProfileById: GetProfileByIdQuery,
    readonly listProfile: ListProfileQuery,
    readonly deleteProfile: DeleteProfile,
    readonly assignPermission: AssignProfilePermission,
    readonly unassignPermission: UnassignProfilePermission,
    readonly grantAndRevokePermission: GrantAndRevokeProfilePermission,
    readonly listProfilePermission: ListProfilePermissionQuery,
  ) {
    const adminAccess = [AuthorizationMiddleware, (req: any, _: any) => adminAuthorizationMiddleware.execute(req)];
    const authorizedAccess = [AuthorizationMiddleware];
    httpServer.post('/profiles/v1', adminAccess, this.executeCreateProfile);
    httpServer.get('/profiles/v1', adminAccess, this.executeListProfile);
    httpServer.get('/profiles/v1/permissions', authorizedAccess, this.executeListProfilePermission);
    httpServer.get('/profiles/v1/:profileId', authorizedAccess, this.executeGetProfileById);
    httpServer.patch('/profiles/v1/:profileId', adminAccess, this.executePatchProfile);
    httpServer.delete('/profiles/v1/:profileId', adminAccess, this.executeDeleteProfile);
    httpServer.post(
      '/profiles/v1/:profileId/functionality/:functionalityId',
      adminAccess,
      this.executeAssignPermission,
    );
    httpServer.delete(
      '/profiles/v1/:profileId/functionality/:functionalityId',
      adminAccess,
      this.executeUnassignPermission,
    );
    httpServer.patch(
      '/profiles/v1/:profileId/functionality/:functionalityId',
      adminAccess,
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
