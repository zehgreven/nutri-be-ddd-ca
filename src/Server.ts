import { GetAccountByIdQuery } from '@src/application/query/GetAccountByIdQuery';
import { ChangePassword } from '@src/application/usecase/account/ChangePassword';
import { SignUp } from '@src/application/usecase/account/SignUp';
import { RefreshToken } from '@src/application/usecase/auth/RefreshToken';
import { SignIn } from '@src/application/usecase/auth/SignIn';
import { CreateProfile } from '@src/application/usecase/profile/CreateProfile';
import DatabaseConnection, { PgPromiseAdapter } from '@src/infra/database/DatabaseConnection';
import { AccountController } from '@src/infra/http/AccountController';
import { AuthController } from '@src/infra/http/AuthController';
import HttpServer, { ExpressHttpServerAdapter } from '@src/infra/http/HttpServer';
import { ProfileController } from '@src/infra/http/ProfileController';
import { AccountRepositoryPostgres } from '@src/infra/repository/AccountRepository';
import { Application } from 'express';
import { GetProfileByIdQuery } from './application/query/GetProfileByIdQuery';
import { ProfileRepositoryPostgres } from './infra/repository/ProfileRepository';

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
    const profileRepository = new ProfileRepositoryPostgres(this.databaseConnection);

    const getAccountById = new GetAccountByIdQuery(this.databaseConnection);
    const getProfileById = new GetProfileByIdQuery(this.databaseConnection);

    const signUp = new SignUp(accountRepository);
    const signIn = new SignIn(accountRepository);
    const refreshToken = new RefreshToken();
    const changePassword = new ChangePassword(accountRepository);
    const createProfile = new CreateProfile(profileRepository);

    new AccountController(this.httpServer, getAccountById, signUp, changePassword);
    new AuthController(this.httpServer, signIn, refreshToken);
    new ProfileController(this.httpServer, createProfile, getProfileById);
  }

  public close(): Promise<void> {
    if (this.databaseConnection) {
      return this.databaseConnection.close();
    }
    return Promise.resolve();
  }
}
