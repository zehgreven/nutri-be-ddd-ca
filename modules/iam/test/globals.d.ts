import { Server } from './Server';

declare global {
  //eslint-disable-next-line no-var
  var testRequest: import('supertest').TestAgent<import('supertest').Test>;
  var server: Server;
}

export {};
