import { InvalidInputError } from '@src/domain/error/InvalidInputError';
import String from '@src/domain/vo/String';
import crypto from 'crypto';

export default class FunctionalityType {
  private constructor(
    readonly id: string,
    private name: String,
    private description: string | undefined,
    private active: boolean,
  ) {}

  static create(name: string, description?: string) {
    const id = crypto.randomUUID();
    const active = true;
    return new FunctionalityType(id, new String('Name', name), description, active);
  }

  static restore(id: string, name: string, description: string, active: boolean) {
    return new FunctionalityType(id, new String('Name', name), description, active);
  }

  patch(input: FunctionalityTypePatchInput) {
    if (!input || (input.name === undefined && input.active === undefined && input.description === undefined)) {
      throw new InvalidInputError('Patch should have an input with name, description and/or active');
    }

    if (input.name === null || input.active === null) {
      throw new InvalidInputError('Name and Active must not be null');
    }

    if (input.name !== undefined && this.getName() !== input.name) {
      this.name = new String('Name', input.name);
    }

    if (input.description !== undefined) {
      if (input.description === null) {
        this.description = undefined;
      } else if (this.getDescription() !== input.description) {
        this.description = input.description;
      }
    }

    if (input.active !== undefined && this.isActive() !== input.active) {
      this.active = input.active;
    }
  }

  getName() {
    return this.name.getValue();
  }

  getDescription() {
    return this.description;
  }

  isActive() {
    return this.active;
  }
}

type FunctionalityTypePatchInput = {
  name?: string | null;
  description?: string | null;
  active?: boolean | null;
};
