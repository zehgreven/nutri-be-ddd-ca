import express from 'express';

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
    this.app[method](path, callback);
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
