import AccountProfile from '@src/domain/entity/AccountProfile';
import DatabaseConnection from '../database/DatabaseConnection';

export interface AccountProfileRepository {
  save(accountProfile: AccountProfile): Promise<void>;
}

export class AccountProfileRepositoryPostgres implements AccountProfileRepository {
  constructor(private connection: DatabaseConnection) {}

  async save(accountProfile: AccountProfile): Promise<void> {
    const query =
      'insert into iam.account_profile (id, account_id, profile_id) values ($(id), $(accountId), $(profileId))';
    await this.connection.query(query, {
      id: accountProfile.id,
      accountId: accountProfile.accountId,
      profileId: accountProfile.profileId,
    });
    this.connection.commit();
  }
}

export class AccountProfileRepositoryMemoryDatabase implements AccountProfileRepository {
  private accountProfiles: AccountProfile[] = [];

  async save(accountProfile: AccountProfile): Promise<void> {
    this.accountProfiles.push(accountProfile);
  }
}
