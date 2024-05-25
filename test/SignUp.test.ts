import { SignUp } from '@src/application/usecase/SignUp';
import { InvalidEmailError } from '@src/domain/error/InvalidEmailError';
import { PasswordCreationError } from '@src/domain/error/PasswordCreationError';
import { AccountRepositoryMemoryDatabase } from '@src/infra/repository/AccountRepository';

const accountRepository = new AccountRepositoryMemoryDatabase();
const signUp = new SignUp(accountRepository);

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
