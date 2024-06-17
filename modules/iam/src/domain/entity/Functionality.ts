import { InvalidInputError } from '@src/domain/error/InvalidInputError';
import String from '@src/domain/vo/String';
import crypto from 'crypto';

export default class Functionality {
  private constructor(
    private functionalityTypeId: string,
    readonly id: string,
    private name: String,
    private description: string | undefined,
    private path: string | undefined,
    private active: boolean,
  ) {}

  static create(functionalityTypeId: string, name: string, description?: string, path?: string) {
    const id = crypto.randomUUID();
    const active = true;
    return new Functionality(functionalityTypeId, id, new String('Name', name), description, path, active);
  }

  static restore(
    functionalityTypeId: string,
    id: string,
    name: string,
    description: string,
    path: string,
    active: boolean,
  ) {
    return new Functionality(functionalityTypeId, id, new String('Name', name), description, path, active);
  }

  patch(input: FunctionalityPatchInput) {
    if (
      !input ||
      (input.functionalityTypeId === undefined &&
        input.name === undefined &&
        input.active === undefined &&
        input.description === undefined &&
        input.path === undefined)
    ) {
      throw new InvalidInputError('Patch should have an input with name, description, path and/or active');
    }

    if (input.name === null || input.active === null || input.functionalityTypeId === null) {
      throw new InvalidInputError('Name, Active and Functionality Type must not be null');
    }

    if (input.name !== undefined && this.getName() !== input.name) {
      this.name = new String('Name', input.name);
    }

    if (input.functionalityTypeId !== undefined && this.functionalityTypeId !== input.functionalityTypeId) {
      this.functionalityTypeId = input.functionalityTypeId;
    }

    if (input.description !== undefined) {
      if (input.description === null) {
        this.description = undefined;
      } else if (this.description !== input.description) {
        this.description = input.description;
      }
    }

    if (input.path !== undefined) {
      if (input.path === null) {
        this.path = undefined;
      } else if (this.path !== input.path) {
        this.path = input.path;
      }
    }

    if (input.active !== undefined && this.active !== input.active) {
      this.active = input.active;
    }
  }

  getFunctionalityTypeId() {
    return this.functionalityTypeId;
  }

  getName() {
    return this.name.getValue();
  }

  getDescription() {
    return this.description;
  }

  getPath() {
    return this.path;
  }

  isActive() {
    return this.active;
  }
}

type FunctionalityPatchInput = {
  functionalityTypeId?: string | null;
  name?: string | null;
  description?: string | null;
  path?: string | null;
  active?: boolean | null;
};
