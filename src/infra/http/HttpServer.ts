import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AccountNotFoundError } from '../../domain/error/AccountNotFoundError';
import { InvalidEmailError } from '../../domain/error/InvalidEmailError';
import { PasswordCreationError } from '../../domain/error/PasswordCreationError';
import { IncorrectCredentialsError } from '../../domain/error/IncorrectCredentialsError';
import { UnauthorizedError } from '../../domain/error/UnauthorizedError';

export type MiddlewareFunction = (req: any, res: any) => void;
export type CallbackFunction = (params: any, body: any, accountId?: string) => any;

export default interface httpServer {
  listen(port: number, callback: Function): void;
  get(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void;
  post(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void;
  put(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void;
  delete(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void;
  patch(path: string, middlewares: MiddlewareFunction[], callback: CallbackFunction): void;
}

export class ExpressHttpServerAdapter implements httpServer {
  private app: any;

  constructor() {
    this.app = express();
    this.app.use(express.json());
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
      async (req: any, res: any, next: Function) => {
        await this.executeMiddlewares(middlewares, req, res, next);
      },
      async (req: any, res: any) => {
        try {
          const result = await callback(req.params, req.body, req.accountId);
          res.json(result);
        } catch (error: any) {
          const statusCode = this.mapErrorToStatusCode(error);
          res.status(statusCode).json({
            message: error.message,
          });
        }
      },
    );
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
      [PasswordCreationError.name]: StatusCodes.BAD_REQUEST,
      [InvalidEmailError.name]: StatusCodes.BAD_REQUEST,
      [IncorrectCredentialsError.name]: StatusCodes.UNAUTHORIZED,
      [UnauthorizedError.name]: StatusCodes.UNAUTHORIZED,
    };

    return statusCodeMap[error.name] || StatusCodes.INTERNAL_SERVER_ERROR;
  }
}
