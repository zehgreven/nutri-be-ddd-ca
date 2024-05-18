import { SignIn } from '../../application/usecase/SignIn';
import httpServer, { CallbackFunction } from './HttpServer';

export class AuthController {
  constructor(
    readonly httpServer: httpServer,
    readonly signIn: SignIn,
  ) {
    httpServer.post('/auth/v1', [], this.executeSignIn);
  }

  private executeSignIn: CallbackFunction = (_: any, body: any) => {
    return this.signIn.execute(body);
  };
}
