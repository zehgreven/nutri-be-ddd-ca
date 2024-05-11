import { StatusCodes } from 'http-status-codes';
import { SignIn } from '../../application/usecase/SignIn';
import httpServer from './HttpServer';
import { IncorrectCredentialsError } from '../../domain/error/IncorrectCredentialsError';

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
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

        if (error instanceof IncorrectCredentialsError) {
          statusCode = StatusCodes.UNAUTHORIZED;
        }

        res.status(statusCode).json({
          message: error.message,
        });
      }
    });
  }
}
