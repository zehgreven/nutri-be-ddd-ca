import crypto from 'crypto';
import Email from '../vo/Email';
import Password from '../vo/Password';

export default class Account {
  private constructor(
    readonly id: string,
    readonly username: Email,
    readonly password: Password,
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
}
