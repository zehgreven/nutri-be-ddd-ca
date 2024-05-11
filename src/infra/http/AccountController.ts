import { GetAccountById } from '../../application/usecase/GetAccountById';
import { SignUp } from '../../application/usecase/SignUp';
import httpServer from './HttpServer';

export class AccountController {
  constructor(httpServer: httpServer, getAccountById: GetAccountById, signUp: SignUp) {
    this.registerGetAccountById(httpServer, getAccountById);
    this.registerSignUp(httpServer, signUp);
  }

  private registerGetAccountById(httpServer: httpServer, getAccountById: GetAccountById) {
    httpServer.get('/accounts/v1/:accountId', async (params: any) => {
      const accountId = params.accountId;
      return await getAccountById.execute(accountId);
    });
  }

  private registerSignUp(httpServer: httpServer, signUp: SignUp) {
    httpServer.post('/accounts/v1', async (params: any, body: any) => {
      return await signUp.execute(body);
    });
  }
}
