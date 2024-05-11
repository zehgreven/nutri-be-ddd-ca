import { StatusCodes } from 'http-status-codes';
import { GetAccountById } from '../../application/usecase/GetAccountById';
import { SignUp } from '../../application/usecase/SignUp';
import { AccountNotFoundError } from '../../domain/error/AccountNotFoundError';
import { InvalidEmailError } from '../../domain/error/InvalidEmailError';
import { PasswordCreationError } from '../../domain/error/PasswordCreationError';
import httpServer from './HttpServer';

export class AccountController {
  constructor(httpServer: httpServer, getAccountById: GetAccountById, signUp: SignUp) {
    this.registerGetAccountById(httpServer, getAccountById);
    this.registerSignUp(httpServer, signUp);
  }

  private registerGetAccountById(httpServer: httpServer, getAccountById: GetAccountById) {
    httpServer.get('/accounts/v1/:accountId', async (req: any, res: any) => {
      try {
        const accountId = req.params.accountId;
        const account = await getAccountById.execute(accountId);
        res.json(account);
      } catch (error: any) {
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

        if (error instanceof AccountNotFoundError) {
          statusCode = StatusCodes.NOT_FOUND;
        }

        res.status(statusCode).json({
          message: error.message,
        });
      }
    });
  }

  private registerSignUp(httpServer: httpServer, signUp: SignUp) {
    httpServer.post('/accounts/v1', async (req: any, res: any) => {
      try {
        const account = await signUp.execute(req.body);
        res.json(account);
      } catch (error: any) {
        let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

        if (error instanceof PasswordCreationError || error instanceof InvalidEmailError) {
          statusCode = StatusCodes.BAD_REQUEST;
        }

        res.status(statusCode).json({
          message: error.message,
        });
      }
    });
  }
}
