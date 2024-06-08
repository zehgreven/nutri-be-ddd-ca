import { ChangePassword } from '@src/application/usecase/account/ChangePassword';
import Account from '@src/domain/entity/Account';
import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import { PasswordCreationError } from '@src/domain/error/PasswordCreationError';
import sinon from 'sinon';

describe('ChangePassword', () => {
  const accountRepository = {
    save: sinon.stub(),
    updatePassword: sinon.stub(),
    getById: sinon.stub(),
    getByUsername: sinon.stub(),
    existsById: sinon.stub(),
  };

  const changePassword = new ChangePassword(accountRepository);

  let account: Account;

  beforeEach(async () => {
    account = Account.create('john-doe@test.com', 'secret');
    accountRepository.getById.resetBehavior();
  });

  it('should throw an error when accountId is undefined', async () => {
    accountRepository.getById.resolves();
    await expect(changePassword.execute({ oldPassword: 'secret', newPassword: 'new-secret' })).rejects.toThrow(
      AccountNotFoundError,
    );
  });

  it('should throw an error when account not found', async () => {
    await expect(
      changePassword.execute(
        { oldPassword: 'secret', newPassword: 'new-secret' },
        '2e08a3b8-7a0b-4f64-bb91-b093116776b3',
      ),
    ).rejects.toThrow(AccountNotFoundError);
  });

  it('should throw an error when old password is incorrect', async () => {
    accountRepository.getById.resolves(account);
    await expect(
      changePassword.execute({ oldPassword: 'incorrect-old-password', newPassword: 'new-secret' }, account.id),
    ).rejects.toThrow(PasswordCreationError);
  });

  it('should throw an error when new password is the same as old', async () => {
    accountRepository.getById.resolves(account);
    await expect(changePassword.execute({ oldPassword: 'secret', newPassword: 'secret' }, account.id)).rejects.toThrow(
      PasswordCreationError,
    );
  });
});
