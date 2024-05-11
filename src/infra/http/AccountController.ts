import { StatusCodes } from 'http-status-codes';
import { GetAccountById } from '../../application/usecase/GetAccountById';
import { SignUp } from '../../application/usecase/SignUp';
import httpServer from './HttpServer';

export class AccountController {
  constructor(httpServer: httpServer, getAccountById: GetAccountById, signUp: SignUp) {
    this.registerGetAccountById(httpServer, getAccountById);
    this.registerSignUp(httpServer, signUp);
  }

  private registerGetAccountById(httpServer: httpServer, getAccountById: GetAccountById) {
    httpServer.get('/accounts/:accountId', async (req: any, res: any) => {
      try {
        const accountId = req.params.accountId;
        const account = await getAccountById.execute(accountId);
        res.json(account);
      } catch (error: any) {
        res.status(StatusCodes.NOT_FOUND).json({
          message: error.message,
        });
      }
    });
  }

  private registerSignUp(httpServer: httpServer, signUp: SignUp) {
    httpServer.post('/accounts', async (req: any, res: any) => {
      try {
        const account = await signUp.execute(req.body);
        res.json(account);
      } catch (error: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: error.message,
        });
      }
    });
  }
}
