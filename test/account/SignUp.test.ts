import { SignUp } from '@src/application/usecase/account/SignUp';
import { InvalidEmailError } from '@src/domain/error/InvalidEmailError';
import { PasswordCreationError } from '@src/domain/error/PasswordCreationError';

const accountRepository = {
  save: () => Promise.resolve(),
  updatePassword: () => Promise.resolve(),
  getById: () => Promise.resolve(undefined),
  getByUsername: () => Promise.resolve(undefined),
  existsById: () => Promise.resolve(false),
};

const accountProfileRepository = {
  save: () => Promise.resolve(),
  deleteByAccountIdAndProfileId: () => Promise.resolve(),
};

const signUp = new SignUp(accountRepository, accountProfileRepository);

describe('SignUp', () => {
  test('username should be an email', async () => {
    const input = {
      username: 'johndoe',
      password: 'secret',
    };

    await expect(() => signUp.execute(input)).rejects.toThrow(InvalidEmailError);
  });

  test('password should be at least 4 characters long', async () => {
    const input = {
      username: 'johndoe@test.com',
      password: '123',
    };

    await expect(() => signUp.execute(input)).rejects.toThrow(PasswordCreationError);
  });
});
