import { GetFunctionalityByIdQuery } from '@src/application/query/functionality/GetFunctionalityByIdQuery';
import { ListFunctionalityQuery } from '@src/application/query/functionality/ListFunctionalityQuery';
import { CreateFunctionality } from '@src/application/usecase/functionality/CreateFunctionality';
import { DeleteFunctionality } from '@src/application/usecase/functionality/DeleteFunctionality';
import { PatchFunctionality } from '@src/application/usecase/functionality/PatchFunctionality';
import AuthorizationMiddleware from '@src/infra/http/AuthorizationMiddleware';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';
import { AdminAuthorizationMiddleware } from './AdminAuthorizationMiddleware';

export class FunctionalityController {
  constructor(
    readonly httpServer: HttpServer,
    readonly adminAuthorizationMiddleware: AdminAuthorizationMiddleware,
    readonly createFunctionality: CreateFunctionality,
    readonly patchFunctionality: PatchFunctionality,
    readonly getFunctionalityById: GetFunctionalityByIdQuery,
    readonly listFunctionality: ListFunctionalityQuery,
    readonly deleteFunctionality: DeleteFunctionality,
  ) {
    const adminAccess = [AuthorizationMiddleware, (req: any) => adminAuthorizationMiddleware.execute(req)];
    const authorizedAccess = [AuthorizationMiddleware];
    httpServer.post('/functionalities/v1', adminAccess, this.executeCreateFunctionality);
    httpServer.get('/functionalities/v1', authorizedAccess, this.executeListFunctionality);
    httpServer.get('/functionalities/v1/:id', authorizedAccess, this.executeGetFunctionalityById);
    httpServer.patch('/functionalities/v1/:id', adminAccess, this.executePatchFunctionality);
    httpServer.delete('/functionalities/v1/:id', adminAccess, this.executeDeleteFunctionality);
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
