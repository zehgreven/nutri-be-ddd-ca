import { TextLengthError } from '@src/domain/error/TextLengthError';

export default class String {
  private readonly MAX_LENGTH = 255;
  private readonly MIN_LENGTH = 4;

  private value: string;

  constructor(field: string, value: string) {
    if (this.isValueLengthValid(value)) {
      throw new TextLengthError(`${field} must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters long`);
    }
    this.value = value;
  }

  private isValueLengthValid(value: string) {
    return value.length < this.MIN_LENGTH || value.length > this.MAX_LENGTH;
  }

  getValue() {
    return this.value;
  }
}
