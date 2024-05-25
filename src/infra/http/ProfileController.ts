import { GetProfileByIdQuery } from '@src/application/query/GetProfileByIdQuery';
import { CreateProfile } from '@src/application/usecase/profile/CreateProfile';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';
import AuthorizationMiddleware from './AuthorizationMiddleware';

export class ProfileController {
  constructor(
    readonly httpServer: HttpServer,
    readonly createProfile: CreateProfile,
    readonly getProfileById: GetProfileByIdQuery,
  ) {
    httpServer.post('/profiles/v1', [AuthorizationMiddleware], this.executeCreateProfile);
    httpServer.get('/profiles/v1/:profileId', [AuthorizationMiddleware], this.executeGetProfileById);
  }

  private executeCreateProfile: CallbackFunction = (_: any, body: any) => {
    return this.createProfile.execute(body);
  };

  private executeGetProfileById: CallbackFunction = (params: any) => {
    const profileId = params.profileId;
    return this.getProfileById.execute(profileId);
  };
}
