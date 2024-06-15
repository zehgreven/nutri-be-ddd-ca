import AccountProfile from '@src/domain/entity/AccountProfile';

describe('AccountProfile', () => {
  it('should be able to create an account profile', () => {
    const accountProfile = AccountProfile.create('account-id', 'profile-id');
    expect(accountProfile.id).toBeDefined();
    expect(accountProfile.accountId).toBe('account-id');
    expect(accountProfile.profileId).toBe('profile-id');
  });
});
