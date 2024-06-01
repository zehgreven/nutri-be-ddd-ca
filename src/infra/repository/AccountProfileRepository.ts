import AccountProfile from '@src/domain/entity/AccountProfile';
import DatabaseConnection from '../database/DatabaseConnection';

export interface AccountProfileRepository {
  save(accountProfile: AccountProfile): Promise<void>;
  deleteByAccountIdAndProfileId(accountId: string, profileId: string): Promise<void>;
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

  async deleteByAccountIdAndProfileId(accountId: string, profileId: string): Promise<void> {
    const query = `
      update iam.account_profile 
      set deleted = now()
      where account_id = $(accountId) 
      and profile_id = $(profileId) 
      and deleted is null
    `;
    await this.connection.query(query, { accountId, profileId });
    this.connection.commit();
  }
}

export class AccountProfileRepositoryMemoryDatabase implements AccountProfileRepository {
  private accountProfiles: AccountProfile[] = [];

  async save(accountProfile: AccountProfile): Promise<void> {
    this.accountProfiles.push(accountProfile);
  }

  async deleteByAccountIdAndProfileId(accountId: string, profileId: string): Promise<void> {
    this.accountProfiles = this.accountProfiles.filter(
      accountProfile => accountProfile.accountId !== accountId || accountProfile.profileId !== profileId,
    );
  }
}
