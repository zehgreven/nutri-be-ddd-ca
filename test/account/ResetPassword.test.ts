import { ResetPassword } from '@src/application/usecase/account/ResetPassword';
import Account from '@src/domain/entity/Account';
import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import bcrypt from 'bcrypt';
import sinon from 'sinon';

describe('ResetPassword', () => {
  const account = Account.create('johndoe@test.com', 'secret');

  const accountRepository = {
    save: sinon.stub(),
    updateActive: sinon.stub(),
    updatePassword: sinon.mock(),
    getById: sinon.stub(),
    getByUsername: sinon.stub(),
    existsById: sinon.stub(),
    deleteById: sinon.stub(),
  };

  const messaging = {
    connect: sinon.stub(),
    setup: sinon.stub(),
    publish: sinon.mock(),
    subscribe: sinon.stub(),
    close: sinon.stub(),
  };

  const resetPassword = new ResetPassword(accountRepository, messaging);

  beforeEach(() => {
    accountRepository.getById.reset();
    accountRepository.updatePassword.reset();
  });

  it('should be able to reset password', async () => {
    accountRepository.getById.resolves(account);
    const accountResetPasswordMethod = sinon.spy(account, 'resetPassword');

    accountRepository.updatePassword.once().callsFake(data => {
      const passwordComparison = bcrypt.compareSync('secret', data.getPassword());
      expect(passwordComparison).toBeFalsy();
    });

    messaging.publish.once().callsFake((exchange, data) => {
      expect(exchange).toBe('iam.account.updated');
      expect(data.event).toBe('PASSWORD_RESETED');
      expect(data.id).toBe(account.id);
    });

    await resetPassword.execute(account.id);

    expect(accountResetPasswordMethod.calledOnce).toBeTruthy();
  });

  it('should return error when account not found', async () => {
    accountRepository.getById.resolves();
    await expect(resetPassword.execute(account.id)).rejects.toThrow(AccountNotFoundError);
  });
});
