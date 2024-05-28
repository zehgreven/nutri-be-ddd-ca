import { GetProfileByIdQuery } from '@src/application/query/GetProfileByIdQuery';
import { CreateProfile } from '@src/application/usecase/profile/CreateProfile';
import { PatchProfile } from '@src/application/usecase/profile/PatchProfile';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';
import AuthorizationMiddleware from './AuthorizationMiddleware';

export class ProfileController {
  constructor(
    readonly httpServer: HttpServer,
    readonly createProfile: CreateProfile,
    readonly patchProfile: PatchProfile,
    readonly getProfileById: GetProfileByIdQuery,
  ) {
    httpServer.post('/profiles/v1', [AuthorizationMiddleware], this.executeCreateProfile);
    httpServer.get('/profiles/v1/:profileId', [AuthorizationMiddleware], this.executeGetProfileById);
    httpServer.patch('/profiles/v1/:profileId', [AuthorizationMiddleware], this.executePatchProfile);
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
}
