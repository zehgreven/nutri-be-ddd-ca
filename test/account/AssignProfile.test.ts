import { AssignProfile } from '@src/application/usecase/account/AssignProfile';
import Account from '@src/domain/entity/Account';
import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import { ProfileNotFoundError } from '@src/domain/error/ProfileNotFoundError';
import sinon from 'sinon';

describe('AssignProfile', () => {
  const accountRepository = {
    save: sinon.stub(),
    updateActive: sinon.mock(),
    updatePassword: sinon.stub(),
    getById: sinon.stub(),
    getByUsername: sinon.stub(),
    existsById: sinon.stub(),
    deleteById: sinon.stub(),
  };

  const profileRepository = {
    save: sinon.stub(),
    update: sinon.stub(),
    getById: sinon.stub(),
    deleteById: sinon.stub(),
    existsById: sinon.stub(),
  };

  const accountProfileRepository = {
    save: sinon.stub(),
    deleteByAccountIdAndProfileId: sinon.stub(),
  };

  const assignProfile = new AssignProfile(accountRepository, profileRepository, accountProfileRepository);

  afterEach(() => {
    accountRepository.getById.resolves();
  });

  it('should throw error when account does not exists', async () => {
    await expect(
      assignProfile.execute('faaa7ee4-f5c7-4dca-b65b-27331b1dcd4e', '27b45d06-ff53-4755-b799-2468e2987961'),
    ).rejects.toThrow(AccountNotFoundError);
  });

  it('should throw error when profile does not exists', async () => {
    const account = Account.create('johndoe@test.com', 'secret');
    accountRepository.getById.resolves(account);

    await expect(assignProfile.execute(account.id, 'faaa7ee4-f5c7-4dca-b65b-27331b1dcd4e')).rejects.toThrow(
      ProfileNotFoundError,
    );
  });
});
