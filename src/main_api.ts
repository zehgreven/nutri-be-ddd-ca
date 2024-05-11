import { GetAccountById } from './application/usecase/GetAccountById';
import { AccountRepositoryPostgres } from './infra/repository/AccountRepository';
import { SignUp } from './application/usecase/SignUp';
import { ExpressHttpServerAdapter } from './infra/http/HttpServer';
import { AccountController } from './infra/http/AccountController';
import { PgPromiseAdapter } from './infra/database/DatabaseConnection';

const httpServer = new ExpressHttpServerAdapter();
const databaseConnection = new PgPromiseAdapter();

const accountRepository = new AccountRepositoryPostgres(databaseConnection);
const getAccountById = new GetAccountById(accountRepository);
const signUp = new SignUp(accountRepository);

new AccountController(httpServer, getAccountById, signUp);

httpServer.listen(3000, () => console.log('Server started on port 3000'));
