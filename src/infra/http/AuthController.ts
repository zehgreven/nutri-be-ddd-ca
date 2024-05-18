import { SignIn } from '../../application/usecase/SignIn';
import HttpServer, { CallbackFunction } from './HttpServer';

export class AuthController {
  constructor(
    readonly httpServer: HttpServer,
    readonly signIn: SignIn,
  ) {
    httpServer.post('/auth/v1/authenticate', [], this.executeSignIn);
  }

  private executeSignIn: CallbackFunction = (_: any, body: any) => {
    return this.signIn.execute(body);
  };
}
