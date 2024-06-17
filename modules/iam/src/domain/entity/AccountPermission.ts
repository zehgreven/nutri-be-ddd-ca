import crypto from 'crypto';

export default class AccountPermission {
  private constructor(
    readonly id: string,
    readonly accountId: string,
    readonly functionalityId: string,
    readonly allow: boolean,
    readonly active: boolean,
  ) {}

  static create(accountId: string, functionalityId: string): AccountPermission {
    return new AccountPermission(crypto.randomUUID(), accountId, functionalityId, true, true);
  }

  static restore(id: string, accountId: string, functionalityId: string, allow: boolean, active: boolean) {
    return new AccountPermission(id, accountId, functionalityId, allow, active);
  }
}
