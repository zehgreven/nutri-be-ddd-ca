import { PasswordCreationError } from '@src/domain/error/PasswordCreationError';
import Email from '@src/domain/vo/Email';
import Password from '@src/domain/vo/Password';
import crypto from 'crypto';

export default class Account {
  private constructor(
    readonly id: string,
    readonly username: Email,
    private password: Password,
    private active: boolean,
  ) {}

  static create(username: string, password: string) {
    const id = crypto.randomUUID();
    return new Account(id, new Email(username), Password.create(password), false);
  }

  static restore(id: string, username: string, password: string, active: boolean) {
    return new Account(id, new Email(username), Password.restore(password), active);
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

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  isActive() {
    return this.active;
  }

  resetPassword() {
    this.password = Password.reset();
  }
}
