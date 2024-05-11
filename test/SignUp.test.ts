import { GetAccountById } from '../src/application/usecase/GetAccountById';
import { SignUp } from '../src/application/usecase/SignUp';
import { AccountRepositoryMemoryDatabase } from '../src/infra/repository/AccountRepository';

const accountRepository = new AccountRepositoryMemoryDatabase();
const signUp = new SignUp(accountRepository);
const getAccountById = new GetAccountById(accountRepository);

test('should be able to sign up', async () => {
  const input = {
    username: 'johndoe@test.com',
    password: 'secret',
  };

  const output = await signUp.execute(input);
  expect(output.id).toBeDefined();

  const user = await getAccountById.execute(output.id);
  expect(user.username).toBe(input.username);
  expect(user.password).not.toBe(input.password);
});

test('username should be an email', async () => {
  const input = {
    username: 'johndoe',
    password: 'secret',
  };

  await expect(() => signUp.execute(input)).rejects.toThrow(new Error('Invalid email'));
});

test('password should be at least 4 characters long', async () => {
  const input = {
    username: 'johndoe@test.com',
    password: '123',
  };

  await expect(() => signUp.execute(input)).rejects.toThrow(
    new Error('Your password must be at least 4 characters long'),
  );
});
