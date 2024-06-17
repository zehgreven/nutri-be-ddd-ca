import crypto from 'crypto';

export default class AccountProfile {
  private constructor(
    readonly id: string,
    readonly accountId: string,
    readonly profileId: string,
  ) {}

  static create(accountId: string, profileId: string) {
    const id = crypto.randomUUID();
    return new AccountProfile(id, accountId, profileId);
  }
}
