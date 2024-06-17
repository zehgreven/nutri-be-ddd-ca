import { GetFunctionalityByIdQuery } from '@src/application/query/functionality/GetFunctionalityByIdQuery';
import { ListFunctionalityQuery } from '@src/application/query/functionality/ListFunctionalityQuery';
import { CreateFunctionality } from '@src/application/usecase/functionality/CreateFunctionality';
import { DeleteFunctionality } from '@src/application/usecase/functionality/DeleteFunctionality';
import { PatchFunctionality } from '@src/application/usecase/functionality/PatchFunctionality';
import { inject } from '@src/infra/dependency-injection/Registry';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';
import { AdminAuthorizationMiddleware } from '@src/infra/http/middleware/AdminAuthorizationMiddleware';
import AuthorizationMiddleware from '@src/infra/http/middleware/AuthorizationMiddleware';
import Cache from '../middleware/Cache';

export class FunctionalityController {
  @inject('HttpServer')
  private httpServer!: HttpServer;

  @inject('AdminAuthorizationMiddleware')
  private adminAuthorizationMiddleware!: AdminAuthorizationMiddleware;

  @inject('CreateFunctionality')
  private createFunctionality!: CreateFunctionality;

  @inject('PatchFunctionality')
  private patchFunctionality!: PatchFunctionality;

  @inject('GetFunctionalityByIdQuery')
  private getFunctionalityById!: GetFunctionalityByIdQuery;

  @inject('ListFunctionalityQuery')
  private listFunctionality!: ListFunctionalityQuery;

  @inject('DeleteFunctionality')
  private deleteFunctionality!: DeleteFunctionality;

  @inject('Cache')
  private cache!: Cache;

  constructor() {
    const adminAccess = (req: any, _: any, next: Function) => this.adminAuthorizationMiddleware.execute(req, _, next);
    const authorizedAccess = AuthorizationMiddleware;
    const cached = this.cache.middleware();

    this.httpServer.post('/functionalities/v1', [authorizedAccess, adminAccess], this.executeCreateFunctionality);
    this.httpServer.get('/functionalities/v1', [authorizedAccess, cached], this.executeListFunctionality);
    this.httpServer.get('/functionalities/v1/:id', [authorizedAccess, cached], this.executeGetFunctionalityById);
    this.httpServer.patch('/functionalities/v1/:id', [authorizedAccess, adminAccess], this.executePatchFunctionality);
    this.httpServer.delete('/functionalities/v1/:id', [authorizedAccess, adminAccess], this.executeDeleteFunctionality);
  }

  private executeCreateFunctionality: CallbackFunction = (_: any, body: any) => {
    return this.createFunctionality.execute(body);
  };

  private executePatchFunctionality: CallbackFunction = (params: any, body: any) => {
    return this.patchFunctionality.execute(params.id, body);
  };

  private executeGetFunctionalityById: CallbackFunction = (params: any) => {
    return this.getFunctionalityById.execute(params.id);
  };

  private executeDeleteFunctionality: CallbackFunction = (params: any) => {
    return this.deleteFunctionality.execute(params.id);
  };

  private executeListFunctionality: CallbackFunction = (params: any) => {
    if (!params.limit || params.limit < 1) {
      params.limit = 10;
    }
    if (!params.page || params.page < 1) {
      params.page = 1;
    }
    return this.listFunctionality.execute(params);
  };
}
