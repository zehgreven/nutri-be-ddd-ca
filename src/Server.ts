import { GetAccountByIdQuery } from '@src/application/query/account/GetAccountByIdQuery';
import { GetFunctionalityTypeByIdQuery } from '@src/application/query/functionality-type/GetFunctionalityTypeByIdQuery';
import { ListFunctionalityTypeQuery } from '@src/application/query/functionality-type/ListFunctionalityTypeQuery';
import { GetFunctionalityByIdQuery } from '@src/application/query/functionality/GetFunctionalityByIdQuery';
import { ListFunctionalityQuery } from '@src/application/query/functionality/ListFunctionalityQuery';
import { GetProfileByIdQuery } from '@src/application/query/profile/GetProfileByIdQuery';
import { ListProfileQuery } from '@src/application/query/profile/ListProfileQuery';
import { AssignProfile } from '@src/application/usecase/account/AssignProfile';
import { ChangePassword } from '@src/application/usecase/account/ChangePassword';
import { SignUp } from '@src/application/usecase/account/SignUp';
import { UnassignProfile } from '@src/application/usecase/account/UnassignProfile';
import { RefreshToken } from '@src/application/usecase/auth/RefreshToken';
import { SignIn } from '@src/application/usecase/auth/SignIn';
import { CreateFunctionalityType } from '@src/application/usecase/functionality-type/CreateFunctionalityType';
import { DeleteFunctionalityType } from '@src/application/usecase/functionality-type/DeleteFunctionalityType';
import { PatchFunctionalityType } from '@src/application/usecase/functionality-type/PatchFunctionalityType';
import { CreateFunctionality } from '@src/application/usecase/functionality/CreateFunctionality';
import { DeleteFunctionality } from '@src/application/usecase/functionality/DeleteFunctionality';
import { PatchFunctionality } from '@src/application/usecase/functionality/PatchFunctionality';
import { CreateProfile } from '@src/application/usecase/profile/CreateProfile';
import { DeleteProfile } from '@src/application/usecase/profile/DeleteProfile';
import { PatchProfile } from '@src/application/usecase/profile/PatchProfile';
import DatabaseConnection, { PgPromiseAdapter } from '@src/infra/database/DatabaseConnection';
import { AccountController } from '@src/infra/http/AccountController';
import { AuthController } from '@src/infra/http/AuthController';
import { FunctionalityController } from '@src/infra/http/FunctionalityController';
import { FunctionalityTypeController } from '@src/infra/http/FunctionalityTypeController';
import HttpServer, { ExpressHttpServerAdapter } from '@src/infra/http/HttpServer';
import { ProfileController } from '@src/infra/http/ProfileController';
import logger from '@src/infra/logging/logger';
import { AccountProfileRepositoryPostgres } from '@src/infra/repository/AccountProfileRepository';
import { AccountRepositoryPostgres } from '@src/infra/repository/AccountRepository';
import { FunctionalityRepositoryPostgres } from '@src/infra/repository/FunctionalityRepository';
import { FunctionalityTypeRepositoryPostgres } from '@src/infra/repository/FunctionalityTypeRepository';
import { ProfileRepositoryPostgres } from '@src/infra/repository/ProfileRepository';
import { Application } from 'express';

export class Server {
  private httpServer?: HttpServer;
  private databaseConnection?: DatabaseConnection;

  constructor(
    readonly port: number,
    readonly dbConnectionUri: string,
  ) {}

  public init(): void {
    logger.info('Setup: starting setup');
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

    logger.info(`Trying to start server on port ${this.port}`);
    this.httpServer.listen(this.port as number, () => logger.info(`Server started on port ${this.port}`));
  }

  public stop(): void {}

  private setupDatabase(): void {
    logger.info('Setup: Database');
    this.databaseConnection = new PgPromiseAdapter(this.dbConnectionUri as string);
  }

  public getDatabaseConnection(): DatabaseConnection {
    if (!this.databaseConnection) {
      throw new Error('Missing database connection');
    }

    return this.databaseConnection;
  }

  private setupHttpServer(): void {
    logger.info('Setup: Http Server');
    this.httpServer = new ExpressHttpServerAdapter();
  }

  private setupControllers(): void {
    if (!this.databaseConnection) {
      throw new Error('Missing database connection');
    }

    if (!this.httpServer) {
      throw new Error('Missing http server');
    }

    logger.info('Setup: Repositories');
    const accountRepository = new AccountRepositoryPostgres(this.databaseConnection);
    const profileRepository = new ProfileRepositoryPostgres(this.databaseConnection);
    const accountProfileRepository = new AccountProfileRepositoryPostgres(this.databaseConnection);
    const functionalityTypeRepository = new FunctionalityTypeRepositoryPostgres(this.databaseConnection);
    const functionalityRepository = new FunctionalityRepositoryPostgres(this.databaseConnection);

    logger.info('Setup: Queries');
    const getAccountById = new GetAccountByIdQuery(this.databaseConnection);
    const getProfileById = new GetProfileByIdQuery(this.databaseConnection);
    const listProfile = new ListProfileQuery(this.databaseConnection);
    const getFunctionalityTypeById = new GetFunctionalityTypeByIdQuery(this.databaseConnection);
    const listFunctionalityType = new ListFunctionalityTypeQuery(this.databaseConnection);
    const getFunctionalityById = new GetFunctionalityByIdQuery(this.databaseConnection);
    const listFunctionality = new ListFunctionalityQuery(this.databaseConnection);

    logger.info('Setup: Use Cases');
    const signUp = new SignUp(accountRepository, accountProfileRepository);
    const signIn = new SignIn(accountRepository);
    const refreshToken = new RefreshToken();
    const changePassword = new ChangePassword(accountRepository);
    const createProfile = new CreateProfile(profileRepository);
    const patchProfile = new PatchProfile(profileRepository);
    const deleteProfile = new DeleteProfile(profileRepository);
    const assignProfile = new AssignProfile(accountRepository, profileRepository, accountProfileRepository);
    const unassignProfile = new UnassignProfile(accountProfileRepository);
    const createFunctionalityType = new CreateFunctionalityType(functionalityTypeRepository);
    const patchFunctionalityType = new PatchFunctionalityType(functionalityTypeRepository);
    const deleteFunctionalityType = new DeleteFunctionalityType(functionalityTypeRepository);
    const createFunctionality = new CreateFunctionality(functionalityRepository);
    const patchFunctionality = new PatchFunctionality(functionalityRepository);
    const deleteFunctionality = new DeleteFunctionality(functionalityRepository);

    logger.info('Setup: Controllers');
    new AccountController(this.httpServer, getAccountById, signUp, changePassword, assignProfile, unassignProfile);
    new AuthController(this.httpServer, signIn, refreshToken);
    new ProfileController(this.httpServer, createProfile, patchProfile, getProfileById, listProfile, deleteProfile);
    new FunctionalityTypeController(
      this.httpServer,
      createFunctionalityType,
      patchFunctionalityType,
      getFunctionalityTypeById,
      listFunctionalityType,
      deleteFunctionalityType,
    );
    new FunctionalityController(
      this.httpServer,
      createFunctionality,
      patchFunctionality,
      getFunctionalityById,
      listFunctionality,
      deleteFunctionality,
    );
  }

  public close(): Promise<void> {
    if (this.databaseConnection) {
      return this.databaseConnection.close();
    }
    return Promise.resolve();
  }
}
