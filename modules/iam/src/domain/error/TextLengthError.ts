export class TextLengthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TextLengthError';
  }
}
