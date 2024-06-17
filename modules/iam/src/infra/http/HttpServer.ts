import loggerHttp from '@src/infra/logging/loggerHttp';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ErrorHandlerMiddleware } from './middleware/ErrorHandlerMiddleware';
import LoggerCorrelationIdMiddleware from './middleware/LoggerCorrelationIdMiddleware';

export type CallbackFunction = (params: any, body: any, accountId?: string) => any;

export default interface HttpServer {
  listen(port: number, callback: Function): void;
  getApp(): Application;
  get(path: string, middlewares: any[], callback: CallbackFunction): void;
  post(path: string, middlewares: any[], callback: CallbackFunction): void;
  put(path: string, middlewares: any[], callback: CallbackFunction): void;
  delete(path: string, middlewares: any[], callback: CallbackFunction): void;
  patch(path: string, middlewares: any[], callback: CallbackFunction): void;
}

export class ExpressHttpServerAdapter implements HttpServer {
  private app: any;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(loggerHttp);
    this.app.use(
      cors({
        origin: '*',
      }),
    );
  }

  public getApp(): Application {
    return this.app;
  }

  public listen(port: number, callback: () => void): void {
    this.app.listen(port, callback);
  }

  private register(method: string, path: string, middlewares: any[], callback: CallbackFunction): void {
    this.app[method](
      path,
      ...middlewares,
      LoggerCorrelationIdMiddleware,
      async (req: Request & { accountId?: string }, res: Response, next: any) => {
        try {
          const result = await callback({ ...req.params, ...req.query }, req.body, req.accountId);
          const statusCode = this.mapSuccessToStatusCode(method);
          res.status(statusCode).json(result);
        } catch (error: any) {
          next(error);
        }
      },
      ErrorHandlerMiddleware,
    );
  }

  mapSuccessToStatusCode(method: string) {
    switch (method) {
      case 'post':
        return StatusCodes.CREATED;
      case 'delete':
        return StatusCodes.NO_CONTENT;
      default:
        return StatusCodes.OK;
    }
  }

  public get(path: string, middlewares: any[], callback: CallbackFunction): void {
    this.register('get', path, middlewares, callback);
  }

  public post(path: string, middlewares: any[], callback: CallbackFunction): void {
    this.register('post', path, middlewares, callback);
  }

  public put(path: string, middlewares: any[], callback: CallbackFunction): void {
    this.register('put', path, middlewares, callback);
  }

  public delete(path: string, middlewares: any[], callback: CallbackFunction): void {
    this.register('delete', path, middlewares, callback);
  }

  public patch(path: string, middlewares: any[], callback: CallbackFunction): void {
    this.register('patch', path, middlewares, callback);
  }
}
