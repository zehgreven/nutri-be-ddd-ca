import String from '@src/domain/vo/String';
import crypto from 'crypto';

export default class Profile {
  private constructor(
    readonly id: string,
    private name: String,
    private description: String,
    private active: boolean,
  ) {}

  static create(name: string, description: string) {
    const id = crypto.randomUUID();
    const active = true;
    return new Profile(id, new String('Name', name), new String('Description', description), active);
  }

  getName() {
    return this.name.getValue();
  }

  getDescription() {
    return this.description.getValue();
  }

  isActive() {
    return this.active;
  }
}
