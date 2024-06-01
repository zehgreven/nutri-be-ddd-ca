import { GetAccountByIdQuery } from '@src/application/query/GetAccountByIdQuery';
import { GetProfileByIdQuery } from '@src/application/query/GetProfileByIdQuery';
import { ChangePassword } from '@src/application/usecase/account/ChangePassword';
import { SignUp } from '@src/application/usecase/account/SignUp';
import { RefreshToken } from '@src/application/usecase/auth/RefreshToken';
import { SignIn } from '@src/application/usecase/auth/SignIn';
import { CreateProfile } from '@src/application/usecase/profile/CreateProfile';
import { PatchProfile } from '@src/application/usecase/profile/PatchProfile';
import DatabaseConnection, { PgPromiseAdapter } from '@src/infra/database/DatabaseConnection';
import { AccountController } from '@src/infra/http/AccountController';
import { AuthController } from '@src/infra/http/AuthController';
import HttpServer, { ExpressHttpServerAdapter } from '@src/infra/http/HttpServer';
import { ProfileController } from '@src/infra/http/ProfileController';
import { AccountRepositoryPostgres } from '@src/infra/repository/AccountRepository';
import { ProfileRepositoryPostgres } from '@src/infra/repository/ProfileRepository';
import { Application } from 'express';
import { ListProfileQuery } from './application/query/ListProfileQuery';
import { DeleteProfile } from './application/usecase/profile/DeleteProfile';
import { AssignProfile } from './application/usecase/account/AssignProfile';
import { AccountProfileRepositoryPostgres } from './infra/repository/AccountProfileRepository';

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
    const accountProfileRepository = new AccountProfileRepositoryPostgres(this.databaseConnection);

    const getAccountById = new GetAccountByIdQuery(this.databaseConnection);
    const getProfileById = new GetProfileByIdQuery(this.databaseConnection);
    const listProfile = new ListProfileQuery(this.databaseConnection);

    const signUp = new SignUp(accountRepository);
    const signIn = new SignIn(accountRepository);
    const refreshToken = new RefreshToken();
    const changePassword = new ChangePassword(accountRepository);
    const createProfile = new CreateProfile(profileRepository);
    const patchProfile = new PatchProfile(profileRepository);
    const deleteProfile = new DeleteProfile(profileRepository);
    const assignProfile = new AssignProfile(accountRepository, profileRepository, accountProfileRepository);

    new AccountController(this.httpServer, getAccountById, signUp, changePassword, assignProfile);
    new AuthController(this.httpServer, signIn, refreshToken);
    new ProfileController(this.httpServer, createProfile, patchProfile, getProfileById, listProfile, deleteProfile);
  }

  public close(): Promise<void> {
    if (this.databaseConnection) {
      return this.databaseConnection.close();
    }
    return Promise.resolve();
  }
}
