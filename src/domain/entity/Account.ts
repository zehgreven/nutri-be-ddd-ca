import crypto from 'crypto';
import { PasswordCreationError } from '../error/PasswordCreationError';
import Email from '../vo/Email';
import Password from '../vo/Password';

export default class Account {
  private constructor(
    readonly id: string,
    readonly username: Email,
    private password: Password,
  ) {}

  static create(username: string, password: string) {
    const id = crypto.randomUUID();
    return new Account(id, new Email(username), Password.create(password));
  }

  static restore(id: string, username: string, password: string) {
    return new Account(id, new Email(username), Password.restore(password));
  }

  getUsername() {
    return this.username.getValue();
  }

  getPassword() {
    return this.password.getValue();
  }

  isSamePassword(password: string) {
    return this.password.isSamePassword(password);
  }

  changePassword(password: string) {
    if (this.isSamePassword(password)) {
      throw new PasswordCreationError('New password must be different from old password');
    }

    this.password = Password.create(password);
  }
}
