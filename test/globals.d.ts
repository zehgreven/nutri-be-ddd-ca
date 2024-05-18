declare global {
  //eslint-disable-next-line no-var
  var testRequest: import('supertest').TestAgent<import('supertest').Test>;
}

export {};
