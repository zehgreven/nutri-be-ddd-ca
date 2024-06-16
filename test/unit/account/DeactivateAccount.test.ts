import { DeactivateAccount } from '@src/application/usecase/account/DeactivateAccount';
import Account from '@src/domain/entity/Account';
import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import Registry from '@src/infra/dependency-injection/Registry';
import sinon from 'sinon';

describe('Deactivate Account', () => {
  const accountRepository = {
    save: sinon.mock(),
    updateActive: sinon.mock(),
    updatePassword: sinon.stub(),
    getById: sinon.stub(),
    getByUsername: sinon.stub(),
    existsById: sinon.stub(),
    deleteById: sinon.stub(),
  };
  Registry.getInstance().register('AccountRepository', accountRepository);

  const activateAccount = new DeactivateAccount();

  beforeEach(() => {
    accountRepository.getById.reset();
    accountRepository.updateActive.reset();
  });

  it('should deactivate account', async () => {
    const account = Account.create('johndoe@test.com', 'secret');
    account.activate();
    const accountDeactivateMethod = sinon.spy(account, 'deactivate');
    accountRepository.getById.resolves(account);
    accountRepository.updateActive.once().callsFake(data => {
      expect(data.isActive()).toBe(false);
    });

    await activateAccount.execute(account.id);

    expect(accountDeactivateMethod.calledOnce).toBeTruthy();
  });

  it('should throw an error when account does not exists', async () => {
    accountRepository.getById.resolves();
    await expect(activateAccount.execute('invalid_id')).rejects.toThrow(AccountNotFoundError);
  });
});
