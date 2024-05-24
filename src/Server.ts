import { Application } from 'express';
import { GetAccountByIdQuery } from './application/query/GetAccountByIdQuery';
import { RefreshToken } from './application/usecase/RefreshToken';
import { SignIn } from './application/usecase/SignIn';
import { SignUp } from './application/usecase/SignUp';
import DatabaseConnection, { PgPromiseAdapter } from './infra/database/DatabaseConnection';
import { AccountController } from './infra/http/AccountController';
import { AuthController } from './infra/http/AuthController';
import HttpServer, { ExpressHttpServerAdapter } from './infra/http/HttpServer';
import { AccountRepositoryPostgres } from './infra/repository/AccountRepository';

export class Server {
  private httpServer?: HttpServer;
  private databaseConnection?: DatabaseConnection;

  constructor(
    readonly port: number,
    readonly dbConnectionUri: string,
  ) {}

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
    const getAccountById = new GetAccountByIdQuery(this.databaseConnection);
    const signUp = new SignUp(accountRepository);
    const signIn = new SignIn(accountRepository);
    const refreshToken = new RefreshToken();

    new AccountController(this.httpServer, getAccountById, signUp);
    new AuthController(this.httpServer, signIn, refreshToken);
  }

  public close(): Promise<void> {
    if (this.databaseConnection) {
      return this.databaseConnection.close();
    }
    return Promise.resolve();
  }
}
