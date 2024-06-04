export class FunctionalityTypeNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FunctionalityTypeNotFoundError';
  }
}
