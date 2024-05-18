import { RefreshToken } from '../../application/usecase/RefreshToken';
import { SignIn } from '../../application/usecase/SignIn';
import HttpServer, { CallbackFunction } from './HttpServer';

export class AuthController {
  constructor(
    readonly httpServer: HttpServer,
    readonly signIn: SignIn,
    readonly refreshToken: RefreshToken,
  ) {
    httpServer.post('/auth/v1/authenticate', [], this.executeSignIn);
    httpServer.post('/auth/v1/refresh', [], this.executeRefreshToken);
  }

  private executeSignIn: CallbackFunction = (_: any, body: any) => {
    return this.signIn.execute(body);
  };

  private executeRefreshToken: CallbackFunction = (_: any, body: any) => {
    return this.refreshToken.execute(body);
  };
}
