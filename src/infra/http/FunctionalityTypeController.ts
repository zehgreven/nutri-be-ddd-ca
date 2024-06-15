import { GetFunctionalityTypeByIdQuery } from '@src/application/query/functionality-type/GetFunctionalityTypeByIdQuery';
import { ListFunctionalityTypeQuery } from '@src/application/query/functionality-type/ListFunctionalityTypeQuery';
import { CreateFunctionalityType } from '@src/application/usecase/functionality-type/CreateFunctionalityType';
import { DeleteFunctionalityType } from '@src/application/usecase/functionality-type/DeleteFunctionalityType';
import { PatchFunctionalityType } from '@src/application/usecase/functionality-type/PatchFunctionalityType';
import AuthorizationMiddleware from '@src/infra/http/AuthorizationMiddleware';
import HttpServer, { CallbackFunction } from '@src/infra/http/HttpServer';
import { AdminAuthorizationMiddleware } from './AdminAuthorizationMiddleware';

export class FunctionalityTypeController {
  constructor(
    readonly httpServer: HttpServer,
    readonly adminAuthorizationMiddleware: AdminAuthorizationMiddleware,
    readonly createFunctionalityType: CreateFunctionalityType,
    readonly patchFunctionalityType: PatchFunctionalityType,
    readonly getFunctionalityTypeById: GetFunctionalityTypeByIdQuery,
    readonly listFunctionalityType: ListFunctionalityTypeQuery,
    readonly deleteFunctionalityType: DeleteFunctionalityType,
  ) {
    const adminAccess = [AuthorizationMiddleware, (req: any, _: any) => adminAuthorizationMiddleware.execute(req)];
    const authorizedAccess = [AuthorizationMiddleware];
    httpServer.post('/functionality-types/v1', adminAccess, this.executeCreateFunctionalityType);
    httpServer.get('/functionality-types/v1', authorizedAccess, this.executeListFunctionalityType);
    httpServer.get('/functionality-types/v1/:id', authorizedAccess, this.executeGetFunctionalityTypeById);
    httpServer.patch('/functionality-types/v1/:id', adminAccess, this.executePatchFunctionalityType);
    httpServer.delete('/functionality-types/v1/:id', adminAccess, this.executeDeleteFunctionalityType);
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
