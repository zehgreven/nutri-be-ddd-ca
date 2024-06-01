import { AssignProfile } from '@src/application/usecase/account/AssignProfile';
import Account from '@src/domain/entity/Account';
import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import { ProfileNotFoundError } from '@src/domain/error/ProfileNotFoundError';
import { AccountProfileRepositoryMemoryDatabase } from '@src/infra/repository/AccountProfileRepository';
import { AccountRepositoryMemoryDatabase } from '@src/infra/repository/AccountRepository';
import { ProfileRepositoryMemoryDatabase } from '@src/infra/repository/ProfileRepository';

describe('AssignProfile', () => {
  const accountRepository = new AccountRepositoryMemoryDatabase();
  const profileRepository = new ProfileRepositoryMemoryDatabase();
  const accountProfileRepository = new AccountProfileRepositoryMemoryDatabase();

  const assignProfile = new AssignProfile(accountRepository, profileRepository, accountProfileRepository);

  it('should throw error when account does not exists', async () => {
    await expect(
      assignProfile.execute('faaa7ee4-f5c7-4dca-b65b-27331b1dcd4e', '27b45d06-ff53-4755-b799-2468e2987961'),
    ).rejects.toThrow(AccountNotFoundError);
  });

  it('should throw error when profile does not exists', async () => {
    const account = Account.create('johndoe@test.com', 'secret');
    await accountRepository.save(account);
    await expect(assignProfile.execute(account.id, 'faaa7ee4-f5c7-4dca-b65b-27331b1dcd4e')).rejects.toThrow(
      ProfileNotFoundError,
    );
  });
});
