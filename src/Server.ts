import config from 'config';
import { GetAccountById } from './application/usecase/GetAccountById';
import { SignIn } from './application/usecase/SignIn';
import { SignUp } from './application/usecase/SignUp';
import DatabaseConnection, { PgPromiseAdapter } from './infra/database/DatabaseConnection';
import { AccountController } from './infra/http/AccountController';
import { AuthController } from './infra/http/AuthController';
import HttpServer, { ExpressHttpServerAdapter } from './infra/http/HttpServer';
import { AccountRepositoryPostgres } from './infra/repository/AccountRepository';
import { Application } from 'express';
import { RefreshToken } from './application/usecase/RefreshToken';

export class Server {
  private httpServer?: HttpServer;
  private databaseConnection?: DatabaseConnection;

  constructor(
    private port?: number,
    private dbConnectionUri?: string,
  ) {
    if (!port) {
      this.port = 3000;
    }

    if (!dbConnectionUri) {
      this.dbConnectionUri = `postgresql://${config.get('db.user')}:${config.get('db.password')}@${config.get('db.host')}:${config.get('db.port')}/${config.get('db.database')}`;
    }
  }

  public init(): void {
    this.setupDatabase();
    this.setupHttpServer();
    this.setupControllers();
  }

  public getApp(): Application {
    if (!this.httpServer) {
      throw new Error('Missing http server');
    }

    return this.httpServer.getApp();
  }

  public start(): void {
    if (!this.httpServer) {
      throw new Error('Missing http server');
    }

    if (!this.databaseConnection) {
      throw new Error('Missing database connection');
    }

    this.httpServer.listen(this.port as number, () => console.log('Server started on port 3000'));
  }

  public stop(): void {}

  private setupDatabase(): void {
    this.databaseConnection = new PgPromiseAdapter(this.dbConnectionUri as string);
  }

  public getDatabaseConnection(): DatabaseConnection {
    if (!this.databaseConnection) {
      throw new Error('Missing database connection');
    }

    return this.databaseConnection;
  }

  private setupHttpServer(): void {
    this.httpServer = new ExpressHttpServerAdapter();
  }

  private setupControllers(): void {
    if (!this.databaseConnection) {
      throw new Error('Missing database connection');
    }

    if (!this.httpServer) {
      throw new Error('Missing http server');
    }

    const accountRepository = new AccountRepositoryPostgres(this.databaseConnection);
    const getAccountById = new GetAccountById(accountRepository);
    const signUp = new SignUp(accountRepository);
    const signIn = new SignIn(accountRepository);
    const refreshToken = new RefreshToken(accountRepository);

    new AccountController(this.httpServer, getAccountById, signUp);
    new AuthController(this.httpServer, signIn, refreshToken);
  }
}
