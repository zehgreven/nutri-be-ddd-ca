export class PasswordCreationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PasswordCreationError';
  }
}
