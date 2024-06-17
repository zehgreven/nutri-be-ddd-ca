import { RefreshToken } from '@src/application/usecase/auth/RefreshToken';
import { SignIn } from '@src/application/usecase/auth/SignIn';
import { inject } from '@src/infra/dependency-injection/Registry';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';

export class AuthController {
  @inject('HttpServer')
  private httpServer!: HttpServer;

  @inject('SignIn')
  private signIn!: SignIn;

  @inject('RefreshToken')
  private refreshToken!: RefreshToken;

  constructor() {
    this.httpServer.post('/auth/v1/authenticate', [], this.executeSignIn);
    this.httpServer.post('/auth/v1/refresh', [], this.executeRefreshToken);
  }

  private executeSignIn: CallbackFunction = (_: any, body: any) => {
    return this.signIn.execute(body);
  };

  private executeRefreshToken: CallbackFunction = (_: any, body: any) => {
    return this.refreshToken.execute(body);
  };
}
