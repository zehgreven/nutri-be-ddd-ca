import bcrypt from 'bcrypt';
import { PasswordCreationError } from '../error/PasswordCreationError';

export default class Password {
  static readonly PASSWORD_MIN_LENGTH = 4;
  static readonly PASSWORD_MAX_LENGTH = 255;

  private constructor(readonly value: string) {}

  static restore(password: string) {
    return new Password(password);
  }

  static create(password: string) {
    if (Password.isPasswordValid(password))
      throw new PasswordCreationError(
        `Your password must be bewteen ${this.PASSWORD_MIN_LENGTH} and ${this.PASSWORD_MAX_LENGTH} characters long`,
      );
    const passwordHash = bcrypt.hashSync(password, 10);
    return new Password(passwordHash);
  }

  private static isPasswordValid(password: string) {
    return password.length < this.PASSWORD_MIN_LENGTH || password.length > this.PASSWORD_MAX_LENGTH;
  }

  getValue() {
    return this.value;
  }

  isSamePassword(password: string) {
    return bcrypt.compareSync(password, this.value);
  }
}
