import { GetFunctionalityTypeByIdQuery } from '@src/application/query/functionality-type/GetFunctionalityTypeByIdQuery';
import { ListFunctionalityTypeQuery } from '@src/application/query/functionality-type/ListFunctionalityTypeQuery';
import { CreateFunctionalityType } from '@src/application/usecase/functionality-type/CreateFunctionalityType';
import { DeleteFunctionalityType } from '@src/application/usecase/functionality-type/DeleteFunctionalityType';
import { PatchFunctionalityType } from '@src/application/usecase/functionality-type/PatchFunctionalityType';
import { inject } from '@src/infra/dependency-injection/Registry';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';
import { AdminAuthorizationMiddleware } from '@src/infra/http/middleware/AdminAuthorizationMiddleware';
import AuthorizationMiddleware from '@src/infra/http/middleware/AuthorizationMiddleware';

export class FunctionalityTypeController {
  @inject('HttpServer')
  private httpServer!: HttpServer;

  @inject('AdminAuthorizationMiddleware')
  private adminAuthorizationMiddleware!: AdminAuthorizationMiddleware;

  @inject('CreateFunctionalityType')
  private createFunctionalityType!: CreateFunctionalityType;

  @inject('PatchFunctionalityType')
  private patchFunctionalityType!: PatchFunctionalityType;

  @inject('GetFunctionalityTypeByIdQuery')
  private getFunctionalityTypeById!: GetFunctionalityTypeByIdQuery;

  @inject('ListFunctionalityTypeQuery')
  private listFunctionalityType!: ListFunctionalityTypeQuery;

  @inject('DeleteFunctionalityType')
  private deleteFunctionalityType!: DeleteFunctionalityType;

  constructor() {
    const adminAccess = [
      AuthorizationMiddleware,
      (req: any, _: any, next: Function) => this.adminAuthorizationMiddleware.execute(req, _, next),
    ];
    const authorizedAccess = [AuthorizationMiddleware];
    this.httpServer.post('/functionality-types/v1', adminAccess, this.executeCreateFunctionalityType);
    this.httpServer.get('/functionality-types/v1', authorizedAccess, this.executeListFunctionalityType);
    this.httpServer.get('/functionality-types/v1/:id', authorizedAccess, this.executeGetFunctionalityTypeById);
    this.httpServer.patch('/functionality-types/v1/:id', adminAccess, this.executePatchFunctionalityType);
    this.httpServer.delete('/functionality-types/v1/:id', adminAccess, this.executeDeleteFunctionalityType);
  }

  private executeCreateFunctionalityType: CallbackFunction = (_: any, body: any) => {
    return this.createFunctionalityType.execute(body);
  };

  private executePatchFunctionalityType: CallbackFunction = (params: any, body: any) => {
    return this.patchFunctionalityType.execute(params.id, body);
  };

  private executeGetFunctionalityTypeById: CallbackFunction = (params: any) => {
    return this.getFunctionalityTypeById.execute(params.id);
  };

  private executeDeleteFunctionalityType: CallbackFunction = (params: any) => {
    return this.deleteFunctionalityType.execute(params.id);
  };

  private executeListFunctionalityType: CallbackFunction = (params: any) => {
    if (!params.limit || params.limit < 1) {
      params.limit = 10;
    }
    if (!params.page || params.page < 1) {
      params.page = 1;
    }
    return this.listFunctionalityType.execute(params);
  };
}
