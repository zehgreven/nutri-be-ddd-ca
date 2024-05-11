import bcrypt from 'bcrypt';

export default class Password {
  private constructor(readonly value: string) {}

  static restore(password: string) {
    return new Password(password);
  }

  static create(password: string) {
    if (password.length < 4) throw new Error('Your password must be at least 4 characters long');
    const passwordHash = bcrypt.hashSync(password, 10);
    return new Password(passwordHash);
  }

  getValue() {
    return this.value;
  }
}
