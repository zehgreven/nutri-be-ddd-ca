import { GetAccountById } from './application/usecase/GetAccountById';
import { AccountRepositoryPostgres } from './infra/repository/AccountRepository';
import { SignUp } from './application/usecase/SignUp';
import { ExpressHttpServerAdapter } from './infra/http/HttpServer';
import { AccountController } from './infra/http/AccountController';
import { PgPromiseAdapter } from './infra/database/DatabaseConnection';
import { AuthController } from './infra/http/AuthController';
import { SignIn } from './application/usecase/SignIn';

const httpServer = new ExpressHttpServerAdapter();
const databaseConnection = new PgPromiseAdapter('postgres://postgres:123456@localhost:5432/app');

const accountRepository = new AccountRepositoryPostgres(databaseConnection);
const getAccountById = new GetAccountById(accountRepository);
const signUp = new SignUp(accountRepository);
const signIn = new SignIn(accountRepository);

new AccountController(httpServer, getAccountById, signUp);
new AuthController(httpServer, signIn);

httpServer.listen(3000, () => console.log('Server started on port 3000'));
