import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import { ForbiddenError } from '@src/domain/error/ForbiddenError';
import { FunctionalityNotFoundError } from '@src/domain/error/FunctionalityNotFoundError';
import { FunctionalityTypeNotFoundError } from '@src/domain/error/FunctionalityTypeNotFoundError';
import { IncorrectCredentialsError } from '@src/domain/error/IncorrectCredentialsError';
import { InvalidEmailError } from '@src/domain/error/InvalidEmailError';
import { InvalidInputError } from '@src/domain/error/InvalidInputError';
import { PasswordCreationError } from '@src/domain/error/PasswordCreationError';
import { PermissionNotFoundError } from '@src/domain/error/PermissionNotFoundError';
import { ProfileNotFoundError } from '@src/domain/error/ProfileNotFoundError';
import { TextLengthError } from '@src/domain/error/TextLengthError';
import { UnauthorizedError } from '@src/domain/error/UnauthorizedError';
import loggerHttp from '@src/infra/logging/loggerHttp';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import LoggerCorrelationIdMiddleware from './LoggerCorrelationIdMiddleware';

export type MiddlewareFunction = (req: any, res: any) => void;
export type CallbackFunction = (params: any, body: any, accountId?: string) => any;

export default interface HttpServer {
  listen(port: number, callback: Function): void;
  getApp(): Application;
  get(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void;
  post(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void;
  put(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void;
  delete(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void;
  patch(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void;
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

  private async executeMiddlewares(
    middlewares: MiddlewareFunction[],
    req: Request,
    res: Response,
    next: Function,
  ): Promise<void> {
    for (const middleware of middlewares) {
      try {
        await middleware(req, res);
      } catch (error: any) {
        const statusCode = this.mapErrorToStatusCode(error);
        res.err = error;
        res.status(statusCode).json({
          message: error.message,
        });
        return;
      }
    }
    return next();
  }

  private register(method: string, path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void {
    this.app[method](
      path,
      async (req: Request, res: Response, next: Function) => {
        await this.executeMiddlewares(middlewares, req, res, next);
      },
      LoggerCorrelationIdMiddleware,
      async (req: Request & { accountId?: string }, res: Response) => {
        try {
          const result = await callback({ ...req.params, ...req.query }, req.body, req.accountId);
          const statusCode = this.mapSuccessToStatusCode(method);
          res.status(statusCode).json(result);
        } catch (error: any) {
          const statusCode = this.mapErrorToStatusCode(error);
          res.err = error;
          res.status(statusCode).json({
            message: error.message,
          });
        }
      },
    );
  }

  mapSuccessToStatusCode(method: string) {
    switch (method) {
      case 'get':
        return StatusCodes.OK;
      case 'post':
        return StatusCodes.CREATED;
      case 'put':
        return StatusCodes.OK;
      case 'delete':
        return StatusCodes.NO_CONTENT;
      case 'patch':
        return StatusCodes.OK;
      default:
        return StatusCodes.OK;
    }
  }

  public get(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void {
    this.register('get', path, middlewares, callback);
  }

  public post(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void {
    this.register('post', path, middlewares, callback);
  }

  public put(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void {
    this.register('put', path, middlewares, callback);
  }

  public delete(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void {
    this.register('delete', path, middlewares, callback);
  }

  public patch(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void {
    this.register('patch', path, middlewares, callback);
  }

  private mapErrorToStatusCode(error: Error): number {
    const statusCodeMap = {
      [AccountNotFoundError.name]: StatusCodes.NOT_FOUND,
      [FunctionalityNotFoundError.name]: StatusCodes.NOT_FOUND,
      [FunctionalityTypeNotFoundError.name]: StatusCodes.NOT_FOUND,
      [IncorrectCredentialsError.name]: StatusCodes.UNAUTHORIZED,
      [InvalidEmailError.name]: StatusCodes.BAD_REQUEST,
      [InvalidInputError.name]: StatusCodes.BAD_REQUEST,
      [PasswordCreationError.name]: StatusCodes.BAD_REQUEST,
      [PermissionNotFoundError.name]: StatusCodes.NOT_FOUND,
      [ProfileNotFoundError.name]: StatusCodes.NOT_FOUND,
      [TextLengthError.name]: StatusCodes.BAD_REQUEST,
      [UnauthorizedError.name]: StatusCodes.UNAUTHORIZED,
      [ForbiddenError.name]: StatusCodes.FORBIDDEN,
    };

    return statusCodeMap[error.name] || StatusCodes.INTERNAL_SERVER_ERROR;
  }
}
