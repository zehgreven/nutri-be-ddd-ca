import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { AccountNotFoundError } from '../../domain/error/AccountNotFoundError';
import { InvalidEmailError } from '../../domain/error/InvalidEmailError';
import { PasswordCreationError } from '../../domain/error/PasswordCreationError';
import { IncorrectCredentialsError } from '../../domain/error/IncorrectCredentialsError';

export default interface httpServer {
  listen(port: number, callback: Function): void;
  get(path: string, callback: Function): void;
  post(path: string, callback: Function): void;
  put(path: string, callback: Function): void;
  delete(path: string, callback: Function): void;
  patch(path: string, callback: Function): void;
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

  private register(method: string, path: string, callback: Function): void {
    this.app[method](path, async (req: any, res: any) => {
      try {
        const result = await callback(req.params, req.body);
        res.json(result);
      } catch (error: any) {
        const statusCode = this.mapErrorToStatusCode(error);
        res.status(statusCode).json({
          message: error.message,
        });
      }
    });
  }

  private mapErrorToStatusCode(error: Error): number {
    const statusCodeMap = {
      [AccountNotFoundError.name]: StatusCodes.NOT_FOUND,
      [PasswordCreationError.name]: StatusCodes.BAD_REQUEST,
      [InvalidEmailError.name]: StatusCodes.BAD_REQUEST,
      [IncorrectCredentialsError.name]: StatusCodes.UNAUTHORIZED,
    };

    return statusCodeMap[error.name] || StatusCodes.INTERNAL_SERVER_ERROR;
  }

  public get(path: string, callback: Function): void {
    this.register('get', path, callback);
  }

  public post(path: string, callback: Function): void {
    this.register('post', path, callback);
  }

  public put(path: string, callback: Function): void {
    this.register('put', path, callback);
  }

  public delete(path: string, callback: Function): void {
    this.register('delete', path, callback);
  }

  public patch(path: string, callback: Function): void {
    this.register('patch', path, callback);
  }
}
