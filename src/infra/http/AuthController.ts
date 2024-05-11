import { StatusCodes } from 'http-status-codes';
import { SignIn } from '../../application/usecase/SignIn';
import httpServer from './HttpServer';

export class AuthController {
  constructor(httpServer: httpServer, signIn: SignIn) {
    this.registerSignIn(httpServer, signIn);
  }

  private registerSignIn(httpServer: httpServer, signIn: SignIn) {
    httpServer.post('/auth/v1', async (req: any, res: any) => {
      try {
        const account = await signIn.execute(req.body);
        res.json(account);
      } catch (error: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: error.message,
        });
      }
    });
  }
}
