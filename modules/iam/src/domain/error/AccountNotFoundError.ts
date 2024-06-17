export class AccountNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountNotFoundError';
  }
}
