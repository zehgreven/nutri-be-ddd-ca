import { GetAccountById } from './application/usecase/GetAccountById';
import { SignIn } from './application/usecase/SignIn';
import { SignUp } from './application/usecase/SignUp';
import { PgPromiseAdapter } from './infra/database/DatabaseConnection';
import { AccountController } from './infra/http/AccountController';
import { AuthController } from './infra/http/AuthController';
import { ExpressHttpServerAdapter } from './infra/http/HttpServer';
import { AccountRepositoryPostgres } from './infra/repository/AccountRepository';
import config from 'config';

const dbConnectionUri = `postgresql://${config.get('db.user')}:${config.get('db.password')}@${config.get('db.host')}:${config.get('db.port')}/${config.get('db.database')}`;

const httpServer = new ExpressHttpServerAdapter();
const databaseConnection = new PgPromiseAdapter(dbConnectionUri);

const accountRepository = new AccountRepositoryPostgres(databaseConnection);
const getAccountById = new GetAccountById(accountRepository);
const signUp = new SignUp(accountRepository);
const signIn = new SignIn(accountRepository);

new AccountController(httpServer, getAccountById, signUp);
new AuthController(httpServer, signIn);

httpServer.listen(3000, () => console.log('Server started on port 3000'));
