import { GetAccountByIdQuery } from '@src/application/query/account/GetAccountByIdQuery';
import { ListAccountPermissionQuery } from '@src/application/query/account/ListAccountPermissionQuery';
import { ListAccountQuery } from '@src/application/query/account/ListAccountQuery';
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
import Registry from '@src/infra/dependency-injection/Registry';
import { AccountController } from '@src/infra/http/controller/AccountController';
import { AuthController } from '@src/infra/http/controller/AuthController';
import { FunctionalityController } from '@src/infra/http/controller/FunctionalityController';
import { FunctionalityTypeController } from '@src/infra/http/controller/FunctionalityTypeController';
import { ProfileController } from '@src/infra/http/controller/ProfileController';
import HttpServer, { ExpressHttpServerAdapter } from '@src/infra/http/HttpServer';
import { AdminAuthorizationMiddleware } from '@src/infra/http/middleware/AdminAuthorizationMiddleware';
import logger from '@src/infra/logging/logger';
import { Messaging, RabbitMQMessagingAdapter } from '@src/infra/messaging/Messaging';
import { AccountPermissionRepositoryPostgres } from '@src/infra/repository/AccountPermissionRepository';
import { AccountProfileRepositoryPostgres } from '@src/infra/repository/AccountProfileRepository';
import { AccountRepositoryPostgres } from '@src/infra/repository/AccountRepository';
import { FunctionalityRepositoryPostgres } from '@src/infra/repository/FunctionalityRepository';
import { FunctionalityTypeRepositoryPostgres } from '@src/infra/repository/FunctionalityTypeRepository';
import { ProfilePermissionRepositoryPostgres } from '@src/infra/repository/ProfilePermissionRepository';
import { ProfileRepositoryPostgres } from '@src/infra/repository/ProfileRepository';
import swaggerDocument from '@src/swagger.json';
import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

export class Server {
  private registry: Registry;
  private httpServer?: HttpServer;
  private databaseConnection?: DatabaseConnection;
  private messaging?: Messaging;

  constructor(
    readonly port: number,
    readonly dbConnectionUri: string,
    readonly messagingConnectionUri: string,
  ) {
    this.registry = Registry.getInstance();
  }

  public async init(): Promise<void> {
    logger.info('Setup: starting setup');
    this.setupDatabase();
    await this.setupMessaging();
    this.setupHttpServer();
    this.setupControllers();
    this.setupDocumentation();
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
    this.registry.register('DatabaseConnection', this.databaseConnection);
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
    this.registry.register('Messaging', this.messaging);
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
    this.registry.register('HttpServer', this.httpServer);
  }

  private setupControllers(): void {
    if (!this.databaseConnection) {
      throw new Error('Missing database connection');
    }

    if (!this.httpServer) {
      throw new Error('Missing http server');
    }

    logger.info('Setup: Repositories');
    this.registry.register('AccountRepository', new AccountRepositoryPostgres());
    this.registry.register('ProfileRepository', new ProfileRepositoryPostgres());
    this.registry.register('AccountProfileRepository', new AccountProfileRepositoryPostgres());
    this.registry.register('FunctionalityTypeRepository', new FunctionalityTypeRepositoryPostgres());
    this.registry.register('FunctionalityRepository', new FunctionalityRepositoryPostgres());
    this.registry.register('ProfilePermissionRepository', new ProfilePermissionRepositoryPostgres());
    this.registry.register('AccountPermissionRepository', new AccountPermissionRepositoryPostgres());

    logger.info('Setup: Middlewares');
    this.registry.register('AdminAuthorizationMiddleware', new AdminAuthorizationMiddleware());

    logger.info('Setup: Queries');
    this.registry.register('GetAccountByIdQuery', new GetAccountByIdQuery());
    this.registry.register('GetProfileByIdQuery', new GetProfileByIdQuery());
    this.registry.register('ListProfileQuery', new ListProfileQuery());
    this.registry.register('GetFunctionalityTypeByIdQuery', new GetFunctionalityTypeByIdQuery());
    this.registry.register('ListFunctionalityTypeQuery', new ListFunctionalityTypeQuery());
    this.registry.register('GetFunctionalityByIdQuery', new GetFunctionalityByIdQuery());
    this.registry.register('ListFunctionalityQuery', new ListFunctionalityQuery());
    this.registry.register('ListProfilePermissionQuery', new ListProfilePermissionQuery());
    this.registry.register('ListAccountPermissionQuery', new ListAccountPermissionQuery());
    this.registry.register('ListAccountQuery', new ListAccountQuery());

    logger.info('Setup: Use Cases');
    this.registry.register('SignUp', new SignUp());
    this.registry.register('SignIn', new SignIn());
    this.registry.register('RefreshToken', new RefreshToken());
    this.registry.register('ChangePassword', new ChangePassword());
    this.registry.register('CreateProfile', new CreateProfile());
    this.registry.register('PatchProfile', new PatchProfile());
    this.registry.register('DeleteProfile', new DeleteProfile());
    this.registry.register('AssignProfile', new AssignProfile());
    this.registry.register('UnassignProfile', new UnassignProfile());
    this.registry.register('CreateFunctionalityType', new CreateFunctionalityType());
    this.registry.register('PatchFunctionalityType', new PatchFunctionalityType());
    this.registry.register('DeleteFunctionalityType', new DeleteFunctionalityType());
    this.registry.register('CreateFunctionality', new CreateFunctionality());
    this.registry.register('PatchFunctionality', new PatchFunctionality());
    this.registry.register('DeleteFunctionality', new DeleteFunctionality());
    this.registry.register('AssignProfilePermission', new AssignProfilePermission());
    this.registry.register('UnassignProfilePermission', new UnassignProfilePermission());
    this.registry.register('GrantAndRevokeProfilePermission', new GrantAndRevokeProfilePermission());
    this.registry.register('AssignAccountPermission', new AssignAccountPermission());
    this.registry.register('UnassignAccountPermission', new UnassignAccountPermission());
    this.registry.register('GrantAndRevokeAccountPermission', new GrantAndRevokeAccountPermission());
    this.registry.register('DeleteAccount', new DeleteAccount());
    this.registry.register('ActivateAccount', new ActivateAccount());
    this.registry.register('DeactivateAccount', new DeactivateAccount());
    this.registry.register('ResetPassword', new ResetPassword());

    logger.info('Setup: Controllers');
    new AccountController();
    new AuthController();
    new ProfileController();
    new FunctionalityTypeController();
    new FunctionalityController();
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

  public setupDocumentation(): void {
    this.getApp().use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
}
