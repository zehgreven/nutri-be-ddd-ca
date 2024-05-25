import { ChangePassword } from '@src/application/usecase/account/ChangePassword';
import Account from '@src/domain/entity/Account';
import { AccountNotFoundError } from '@src/domain/error/AccountNotFoundError';
import { PasswordCreationError } from '@src/domain/error/PasswordCreationError';
import { AccountRepositoryMemoryDatabase } from '@src/infra/repository/AccountRepository';

describe('ChangePassword', () => {
  const accountRepository = new AccountRepositoryMemoryDatabase();
  const changePassword = new ChangePassword(accountRepository);

  let account: Account;

  beforeEach(async () => {
    await accountRepository.clear();
    account = Account.create('johndoe@test.com', 'secret');
    await accountRepository.save(account);
  });

  it('should be able to change password', async () => {
    const output = await changePassword.execute({ oldPassword: 'secret', newPassword: 'new-secret' }, account.id);
    expect(output.id).toBe(account.id);
    expect(output.username).toBe(account.getUsername());
    expect(output.password).not.toBe('new-secret');
  });

  it('should throw an error when accountId is undefined', async () => {
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
    await expect(
      changePassword.execute({ oldPassword: 'incorrect-old-password', newPassword: 'new-secret' }, account.id),
    ).rejects.toThrow(PasswordCreationError);
  });

  it('should throw an error when new password is the same as old', async () => {
    await expect(changePassword.execute({ oldPassword: 'secret', newPassword: 'secret' }, account.id)).rejects.toThrow(
      PasswordCreationError,
    );
  });
});
