import { ActivateAccount } from '@src/application/usecase/account/ActivateAccount';
import Account from '@src/domain/entity/Account';
import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import sinon from 'sinon';

describe('Activate Account', () => {
  const accountRepository = {
    save: sinon.stub(),
    updateActive: sinon.mock(),
    updatePassword: sinon.stub(),
    getById: sinon.stub(),
    getByUsername: sinon.stub(),
    existsById: sinon.stub(),
    deleteById: sinon.stub(),
  };
  const activateAccount = new ActivateAccount(accountRepository);

  beforeEach(() => {
    accountRepository.getById.reset();
    accountRepository.updateActive.reset();
  });

  it('should activate account', async () => {
    const account = Account.create('johndoe@test.com', 'secret');
    const accountActivateMethod = sinon.spy(account, 'activate');
    accountRepository.getById.resolves(account);
    accountRepository.updateActive.once().callsFake(data => {
      expect(data.isActive()).toBe(true);
    });

    await activateAccount.execute(account.id);

    expect(accountActivateMethod.calledOnce).toBeTruthy();
  });

  it('should throw an error when account does not exists', async () => {
    accountRepository.getById.resolves();
    await expect(activateAccount.execute('invalid_id')).rejects.toThrow(AccountNotFoundError);
  });
});
