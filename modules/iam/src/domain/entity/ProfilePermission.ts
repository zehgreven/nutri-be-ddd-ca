import crypto from 'crypto';

export default class ProfilePermission {
  private constructor(
    readonly id: string,
    readonly profileId: string,
    readonly functionalityId: string,
    readonly allow: boolean,
    readonly active: boolean,
  ) {}

  static create(profileId: string, functionalityId: string): ProfilePermission {
    return new ProfilePermission(crypto.randomUUID(), profileId, functionalityId, true, true);
  }

  static restore(id: string, profileId: string, functionalityId: string, allow: boolean, active: boolean) {
    return new ProfilePermission(id, profileId, functionalityId, allow, active);
  }
}
