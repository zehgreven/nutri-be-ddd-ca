import { GetFunctionalityByIdQuery } from '@src/application/query/functionality/GetFunctionalityByIdQuery';
import { ListFunctionalityQuery } from '@src/application/query/functionality/ListFunctionalityQuery';
import { CreateFunctionality } from '@src/application/usecase/functionality/CreateFunctionality';
import { DeleteFunctionality } from '@src/application/usecase/functionality/DeleteFunctionality';
import { PatchFunctionality } from '@src/application/usecase/functionality/PatchFunctionality';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';
import AuthorizationMiddleware from './AuthorizationMiddleware';

export class FunctionalityController {
  constructor(
    readonly httpServer: HttpServer,
    readonly createFunctionality: CreateFunctionality,
    readonly patchFunctionality: PatchFunctionality,
    readonly getFunctionalityById: GetFunctionalityByIdQuery,
    readonly listFunctionality: ListFunctionalityQuery,
    readonly deleteFunctionality: DeleteFunctionality,
  ) {
    httpServer.post('/functionalities/v1', [AuthorizationMiddleware], this.executeCreateFunctionality);
    httpServer.get('/functionalities/v1', [AuthorizationMiddleware], this.executeListFunctionality);
    httpServer.get('/functionalities/v1/:id', [AuthorizationMiddleware], this.executeGetFunctionalityById);
    httpServer.patch('/functionalities/v1/:id', [AuthorizationMiddleware], this.executePatchFunctionality);
    httpServer.delete('/functionalities/v1/:id', [AuthorizationMiddleware], this.executeDeleteFunctionality);
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
