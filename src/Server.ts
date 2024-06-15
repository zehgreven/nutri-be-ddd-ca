import { GetAccountByIdQuery } from '@src/application/query/account/GetAccountByIdQuery';
import { ListAccountPermissionQuery } from '@src/application/query/account/ListAccountPermissionQuery';
import { GetFunctionalityTypeByIdQuery } from '@src/application/query/functionality-type/GetFunctionalityTypeByIdQuery';
import { ListFunctionalityTypeQuery } from '@src/application/query/functionality-type/ListFunctionalityTypeQuery';
import { GetFunctionalityByIdQuery } from '@src/application/query/functionality/GetFunctionalityByIdQuery';
import { ListFunctionalityQuery } from '@src/application/query/functionality/ListFunctionalityQuery';
import { GetProfileByIdQuery } from '@src/application/query/profile/GetProfileByIdQuery';
import { ListProfilePermissionQuery } from '@src/application/query/profile/ListProfilePermissionQuery';
import { ListProfileQuery } from '@src/application/query/profile/ListProfileQuery';
import { ActivateAccount } from '@src/application/usecase/account/ActivateAccount';
import { AssignAccountPermission } from '@src/application/usecase/account/AssignAccountPermission';
import { AssignProfile } from '@src/application/usecase/account/AssignProfile';
import { ChangePassword } from '@src/application/usecase/account/ChangePassword';
import { DeactivateAccount } from '@src/application/usecase/account/DeactivateAccount';
import { DeleteAccount } from '@src/application/usecase/account/DeleteAccount';
import { GrantAndRevokeAccountPermission } from '@src/application/usecase/account/GrantAndRevokeAccountPermission';
import { ResetPassword } from '@src/application/usecase/account/ResetPassword';
import { SignUp } from '@src/application/usecase/account/SignUp';
import { UnassignAccountPermission } from '@src/application/usecase/account/UnassignAccountPermission';
import { UnassignProfile } from '@src/application/usecase/account/UnassignProfile';
import { RefreshToken } from '@src/application/usecase/auth/RefreshToken';
import { SignIn } from '@src/application/usecase/auth/SignIn';
import { CreateFunctionalityType } from '@src/application/usecase/functionality-type/CreateFunctionalityType';
import { DeleteFunctionalityType } from '@src/application/usecase/functionality-type/DeleteFunctionalityType';
import { PatchFunctionalityType } from '@src/application/usecase/functionality-type/PatchFunctionalityType';
import { CreateFunctionality } from '@src/application/usecase/functionality/CreateFunctionality';
import { DeleteFunctionality } from '@src/application/usecase/functionality/DeleteFunctionality';
import { PatchFunctionality } from '@src/application/usecase/functionality/PatchFunctionality';
import { AssignProfilePermission } from '@src/application/usecase/profile/AssignProfilePermission';
import { CreateProfile } from '@src/application/usecase/profile/CreateProfile';
import { DeleteProfile } from '@src/application/usecase/profile/DeleteProfile';
import { GrantAndRevokeProfilePermission } from '@src/application/usecase/profile/GrantAndRevokeProfilePermission';
import { PatchProfile } from '@src/application/usecase/profile/PatchProfile';
import { UnassignProfilePermission } from '@src/application/usecase/profile/UnassignProfilePermission';
import DatabaseConnection, { PgPromiseAdapter } from '@src/infra/database/DatabaseConnection';
import { AccountController } from '@src/infra/http/AccountController';
import { AuthController } from '@src/infra/http/AuthController';
import { FunctionalityController } from '@src/infra/http/FunctionalityController';
import { FunctionalityTypeController } from '@src/infra/http/FunctionalityTypeController';
import HttpServer, { ExpressHttpServerAdapter } from '@src/infra/http/HttpServer';
import { ProfileController } from '@src/infra/http/ProfileController';
import logger from '@src/infra/logging/logger';
import { Messaging, RabbitMQMessagingAdapter } from '@src/infra/messaging/Messaging';
import { AccountPermissionRepositoryPostgres } from '@src/infra/repository/AccountPermissionRepository';
import { AccountProfileRepositoryPostgres } from '@src/infra/repository/AccountProfileRepository';
import { AccountRepositoryPostgres } from '@src/infra/repository/AccountRepository';
import { FunctionalityRepositoryPostgres } from '@src/infra/repository/FunctionalityRepository';
import { FunctionalityTypeRepositoryPostgres } from '@src/infra/repository/FunctionalityTypeRepository';
import { ProfilePermissionRepositoryPostgres } from '@src/infra/repository/ProfilePermissionRepository';
import { ProfileRepositoryPostgres } from '@src/infra/repository/ProfileRepository';
import { Application } from 'express';

export class Server {
  private httpServer?: HttpServer;
  private databaseConnection?: DatabaseConnection;
  private messaging?: Messaging;

  constructor(
    readonly port: number,
    readonly dbConnectionUri: string,
    readonly messagingConnectionUri: string,
  ) {}

  public async init(): Promise<void> {
    logger.info('Setup: starting setup');
    this.setupDatabase();
    await this.setupMessaging();
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

  private setupDatabase(): void {
    logger.info('Setup: Database');
    this.databaseConnection = new PgPromiseAdapter(this.dbConnectionUri);
  }

  public getDatabaseConnection(): DatabaseConnection {
    if (!this.databaseConnection) {
      throw new Error('Missing database connection');
    }

    return this.databaseConnection;
  }

  private async setupMessaging(): Promise<void> {
    logger.info('Setup: Messaging');
    this.messaging = new RabbitMQMessagingAdapter();
    if (this.messagingConnectionUri) {
      await this.messaging.connect(this.messagingConnectionUri);
      await this.messaging.setup();
    }
  }

  public getMessaging(): Messaging {
    if (!this.messaging) {
      throw new Error('Missing messaging');
    }
    return this.messaging;
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
    const profilePermissionRepository = new ProfilePermissionRepositoryPostgres(this.databaseConnection);
    const accountPermissionRepository = new AccountPermissionRepositoryPostgres(this.databaseConnection);

    logger.info('Setup: QuerassignPermissionies');
    const getAccountById = new GetAccountByIdQuery(this.databaseConnection);
    const getProfileById = new GetProfileByIdQuery(this.databaseConnection);
    const listProfile = new ListProfileQuery(this.databaseConnection);
    const getFunctionalityTypeById = new GetFunctionalityTypeByIdQuery(this.databaseConnection);
    const listFunctionalityType = new ListFunctionalityTypeQuery(this.databaseConnection);
    const getFunctionalityById = new GetFunctionalityByIdQuery(this.databaseConnection);
    const listFunctionality = new ListFunctionalityQuery(this.databaseConnection);
    const listProfilePermission = new ListProfilePermissionQuery(this.databaseConnection);
    const listAccountPermission = new ListAccountPermissionQuery(this.databaseConnection);

    logger.info('Setup: Use Cases');
    const signUp = new SignUp(accountRepository, accountProfileRepository, this.getMessaging());
    const signIn = new SignIn(accountRepository);
    const refreshToken = new RefreshToken(accountRepository);
    const changePassword = new ChangePassword(accountRepository, this.getMessaging());
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
    const assignProfilePermission = new AssignProfilePermission(
      profileRepository,
      functionalityRepository,
      profilePermissionRepository,
    );
    const unassignProfilePermission = new UnassignProfilePermission(profilePermissionRepository);
    const grantAndRevokeProfilePermission = new GrantAndRevokeProfilePermission(profilePermissionRepository);
    const assignAccountPermission = new AssignAccountPermission(
      accountRepository,
      functionalityRepository,
      accountPermissionRepository,
    );
    const unassignAccountPermission = new UnassignAccountPermission(accountPermissionRepository);
    const grantAndRevokeAccountPermission = new GrantAndRevokeAccountPermission(accountPermissionRepository);
    const deleteAccount = new DeleteAccount(accountRepository);
    const activateAccount = new ActivateAccount(accountRepository);
    const deactivateAccount = new DeactivateAccount(accountRepository);
    const resetPassword = new ResetPassword(accountRepository, this.getMessaging());

    logger.info('Setup: Controllers');
    new AccountController(
      this.httpServer,
      getAccountById,
      signUp,
      changePassword,
      assignProfile,
      unassignProfile,
      assignAccountPermission,
      unassignAccountPermission,
      grantAndRevokeAccountPermission,
      listAccountPermission,
      deleteAccount,
      activateAccount,
      deactivateAccount,
      resetPassword,
    );
    new AuthController(this.httpServer, signIn, refreshToken);
    new ProfileController(
      this.httpServer,
      createProfile,
      patchProfile,
      getProfileById,
      listProfile,
      deleteProfile,
      assignProfilePermission,
      unassignProfilePermission,
      grantAndRevokeProfilePermission,
      listProfilePermission,
    );
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

  public async close(): Promise<void> {
    if (this.databaseConnection) {
      await this.databaseConnection.close();
    }
    if (this.messaging) {
      await this.messaging.close();
    }
    return Promise.resolve();
  }
}
