export class FunctionalityNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FunctionalityNotFoundError';
  }
}
