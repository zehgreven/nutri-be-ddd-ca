import { InvalidEmailError } from '../error/InvalidEmailError';

export default class Email {
  private value: string;

  constructor(email: string) {
    if (!email.match(/^(.+)@(.+)$/)) throw new InvalidEmailError('Invalid email');
    this.value = email;
  }

  getValue() {
    return this.value;
  }
}
