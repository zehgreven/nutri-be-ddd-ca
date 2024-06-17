export class IncorrectCredentialsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IncorrectCredentialsError';
  }
}
