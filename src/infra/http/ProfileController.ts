import { GetProfileByIdQuery } from '@src/application/query/GetProfileByIdQuery';
import { ListProfileQuery } from '@src/application/query/ListProfileQuery';
import { CreateProfile } from '@src/application/usecase/profile/CreateProfile';
import { DeleteProfile } from '@src/application/usecase/profile/DeleteProfile';
import { PatchProfile } from '@src/application/usecase/profile/PatchProfile';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';
import AuthorizationMiddleware from './AuthorizationMiddleware';

export class ProfileController {
  constructor(
    readonly httpServer: HttpServer,
    readonly createProfile: CreateProfile,
    readonly patchProfile: PatchProfile,
    readonly getProfileById: GetProfileByIdQuery,
    readonly listProfile: ListProfileQuery,
    readonly deleteProfile: DeleteProfile,
  ) {
    httpServer.post('/profiles/v1', [AuthorizationMiddleware], this.executeCreateProfile);
    httpServer.get('/profiles/v1', [AuthorizationMiddleware], this.executeListProfile);
    httpServer.get('/profiles/v1/:profileId', [AuthorizationMiddleware], this.executeGetProfileById);
    httpServer.patch('/profiles/v1/:profileId', [AuthorizationMiddleware], this.executePatchProfile);
    httpServer.delete('/profiles/v1/:profileId', [AuthorizationMiddleware], this.executeDeleteProfile);
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
}
