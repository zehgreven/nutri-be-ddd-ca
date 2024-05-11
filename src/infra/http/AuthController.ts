import { SignIn } from '../../application/usecase/SignIn';
import httpServer from './HttpServer';

export class AuthController {
  constructor(httpServer: httpServer, signIn: SignIn) {
    this.registerSignIn(httpServer, signIn);
  }

  private registerSignIn(httpServer: httpServer, signIn: SignIn) {
    httpServer.post('/auth/v1', async (params: any, body: any) => {
      return await signIn.execute(body);
    });
  }
}
